#!/usr/bin/env python3
"""每日看盘日志：抓客观数据，写成一条 Notion 记录。

情绪、唯一动作、逻辑变化不写，留给手机手填。
抓取失败写成「待填」，不让整次运行中断。

用法（在仓库根目录，上海时间）：
  python scripts/watchlog.py preopen   # 09:00 盘前
  python scripts/watchlog.py midday    # 12:30 午盘
  python scripts/watchlog.py close     # 15:15 复盘
  python scripts/watchlog.py week      # 池子里超过 7 天没被复盘点名的票

密钥放 scripts/watchlog.env，不要提交。
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

PENDING = "待填"
SH = ZoneInfo("Asia/Shanghai")
ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = Path(__file__).resolve().parent / "watchlog.env"
CODE_RE = re.compile(r"(\d{6})")

# 视图只露出当次要填的列。日期和节点写在标题里，避免手机上多一排空字段。
NODES = {
    "preopen": "盘前",
    "midday": "午盘",
    "close": "复盘",
    "week": "周检",
}


def load_env() -> None:
    """读本地 env。已在环境里的值优先，避免把空行写回去。"""
    if not ENV_PATH.exists():
        return
    for raw in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def today_sh() -> date:
    return datetime.now(SH).date()


def title_for(day: date, node: str) -> str:
    return f"{day.month:02d}-{day.day:02d} {node}"


def clip(text: str, limit: int = 1800) -> str:
    text = text.strip() or PENDING
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def code6(raw: str) -> str:
    match = CODE_RE.search(raw or "")
    return match.group(1) if match else ""


def plain(prop: dict | None) -> str:
    if not prop:
        return ""
    kind = prop.get("type")
    if kind in ("title", "rich_text"):
        return "".join(part.get("plain_text", "") for part in prop.get(kind, []))
    if kind == "select" and prop.get("select"):
        return prop["select"].get("name") or ""
    if kind == "rollup":
        roll = prop.get("rollup") or {}
        if roll.get("type") == "date" and roll.get("date"):
            return (roll["date"].get("start") or "")[:10]
    return ""


def parse_day(value: str) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def stale_names(rows: list[dict], today: date, days: int = 7) -> list[str]:
    """上次复盘早于今天减 7 天，或从来没被日志点过名，都算过期。"""
    cutoff = today - timedelta(days=days)
    expired = []
    for row in rows:
        seen = parse_day(row.get("last") or "")
        if seen is None or seen < cutoff:
            expired.append(row["name"])
    return expired


def limit_up_frame(day: date):
    """东财涨停池。休市或接口断开时返回 None，调用方改看前一日或写待填。"""
    try:
        import akshare as ak

        frame = ak.stock_zt_pool_em(date=day.strftime("%Y%m%d"))
    except Exception:
        return None
    if frame is None or getattr(frame, "empty", True):
        return None
    return frame


def find_frame(today: date, previous: bool):
    """previous=True 从昨天往前找；否则先今天，没有再往前。最多 10 个工作日。"""
    probe = today - timedelta(days=1) if previous else today
    for _ in range(10):
        if probe.weekday() < 5:
            frame = limit_up_frame(probe)
            if frame is not None:
                return frame
        if not previous and probe == today:
            previous = True
            probe = today - timedelta(days=1)
            continue
        probe -= timedelta(days=1)
    return None


def sector_line(frame) -> str:
    """优先行业涨跌幅榜。榜接口断了就用涨停池里出现最多的行业，并标明是家数不是涨幅。"""
    try:
        import akshare as ak

        board = ak.stock_board_industry_name_em()
        board = board.sort_values("涨跌幅", ascending=False)
        row = board.iloc[0]
        pct = float(row["涨跌幅"])
        return f"{row['板块名称']} {pct:+.1f}%"
    except Exception:
        pass
    if frame is None or "所属行业" not in getattr(frame, "columns", []):
        return PENDING
    series = frame["所属行业"].dropna().astype(str).str.strip()
    series = series[series != ""]
    if series.empty:
        return PENDING
    counts = series.value_counts()
    return f"{counts.index[0]} 涨停{int(counts.iloc[0])}家"


def watch_moves(names: dict[str, str]) -> str:
    """names: 6 位代码 -> 显示名。一次拉全市场行情再过滤，避免逐只请求。"""
    if not names:
        return PENDING
    try:
        import akshare as ak

        frame = ak.stock_zh_a_spot_em()
        frame["代码"] = frame["代码"].astype(str).str.zfill(6)
        picked = frame[frame["代码"].isin(names)]
    except Exception:
        return PENDING
    if picked.empty:
        return PENDING
    parts = []
    for _, row in picked.iterrows():
        code = str(row["代码"]).zfill(6)
        try:
            pct = float(row["涨跌幅"])
            move = f"{pct:+.1f}%"
        except (TypeError, ValueError):
            move = PENDING
        parts.append(f"{names.get(code, code)} {move}")
    return clip("；".join(parts))


def rich(text: str) -> dict:
    return {"rich_text": [{"type": "text", "text": {"content": clip(text)}}]}


def notion_client():
    token = os.environ.get("NOTION_API_KEY", "").strip()
    if not token:
        sys.exit("缺少 NOTION_API_KEY。复制 scripts/watchlog.env.sample 为 scripts/watchlog.env 再填。")
    from notion_client import Client

    # 2.2 走 databases.query。更新的 SDK 把 query 拿掉时，下面用 request 兜住。
    return Client(auth=token)


def db_id(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        sys.exit(f"缺少 {name}。")
    return value


def query_database(notion, database_id: str, **body):
    databases = getattr(notion, "databases", None)
    if databases is not None and hasattr(databases, "query"):
        return databases.query(database_id=database_id, **body)
    return notion.request(path=f"databases/{database_id}/query", method="POST", body=body)


def find_log(notion, database_id: str, day: date, node: str) -> str | None:
    """同一天同一节点只保留一条，重跑时不盖掉手填的情绪和唯一动作。"""
    response = query_database(
        notion,
        database_id,
        filter={
            "and": [
                {"property": "日期", "date": {"equals": day.isoformat()}},
                {"property": "节点", "select": {"equals": node}},
            ]
        },
        page_size=1,
    )
    results = response.get("results") or []
    return results[0]["id"] if results else None


def pool_rows(notion, database_id: str, only_watchlist: bool) -> list[dict]:
    rows = []
    cursor = None
    while True:
        body = {"page_size": 100}
        if only_watchlist:
            body["filter"] = {"property": "池", "select": {"equals": "自选"}}
        if cursor:
            body["start_cursor"] = cursor
        response = query_database(notion, database_id, **body)
        for page in response.get("results") or []:
            props = page.get("properties") or {}
            name = plain(props.get("Name")) or plain(props.get("title"))
            code = code6(plain(props.get("代码"))) or code6(name)
            rows.append(
                {
                    "id": page["id"],
                    "name": name or code or "未命名",
                    "code": code,
                    "last": plain(props.get("上次复盘")),
                }
            )
        if not response.get("has_more"):
            return rows
        cursor = response.get("next_cursor")


def objective_fields(command: str, today: date, watch: dict[str, str]) -> dict:
    """只放脚本该写的列。情绪和唯一动作故意不在这里。"""
    node = NODES[command]
    fields = {
        "Name": {"title": [{"type": "text", "text": {"content": title_for(today, node)}}]},
        "日期": {"date": {"start": today.isoformat()}},
        "节点": {"select": {"name": node}},
    }
    if command == "preopen":
        frame = find_frame(today, previous=True)
        fields["涨停家数"] = rich(PENDING if frame is None else str(len(frame)))
        fields["主线"] = rich(sector_line(frame))
    elif command == "midday":
        frame = find_frame(today, previous=False)
        fields["涨停家数"] = rich(PENDING if frame is None else str(len(frame)))
        fields["热点"] = rich(sector_line(frame))
    elif command == "close":
        frame = find_frame(today, previous=False)
        fields["涨停家数"] = rich(PENDING if frame is None else str(len(frame)))
        fields["主线"] = rich(sector_line(frame))
        fields["自选表现"] = rich(watch_moves(watch))
    else:
        fields["主线"] = rich("；".join(watch.get("_stale", [])) or "无过期")
    return fields


def upsert(notion, database_id: str, day: date, command: str, properties: dict) -> str:
    page_id = find_log(notion, database_id, day, NODES[command])
    if page_id:
        # 重跑只刷新客观列，手填列不在 properties 里。
        notion.pages.update(page_id=page_id, properties=properties)
        return page_id
    created = notion.pages.create(parent={"database_id": database_id}, properties=properties)
    return created["id"]


def build_watch_map(rows: list[dict]) -> dict[str, str]:
    return {row["code"]: row["name"] for row in rows if row["code"]}


def run(command: str, dry_run: bool) -> None:
    today = today_sh()
    load_env()
    watch: dict[str, str] = {}
    notion = None
    pool_id = os.environ.get("NOTION_POOL_DB_ID", "").strip()
    log_id = os.environ.get("NOTION_LOG_DB_ID", "").strip()

    if command in ("close", "week") and not dry_run:
        notion = notion_client()
        if not pool_id:
            sys.exit("缺少 NOTION_POOL_DB_ID。")
        rows = pool_rows(notion, pool_id, only_watchlist=(command == "close"))
        if command == "close":
            watch = build_watch_map(rows)
        else:
            expired = stale_names(rows, today)
            print("过期：" + ("；".join(expired) if expired else "无"))
            watch = {"_stale": expired}
    elif command == "week" and dry_run:
        watch = {"_stale": ["（dry-run 不读池子）"]}
    elif command == "close" and dry_run:
        watch = {}

    properties = objective_fields(command, today, watch)
    shown = {
        key: plain_prop(value)
        for key, value in properties.items()
        if key not in ("情绪", "唯一动作")
    }
    print(f"{title_for(today, NODES[command])}  {shown}")

    if dry_run:
        print("dry-run：没写 Notion。")
        return

    if notion is None:
        notion = notion_client()
    if not log_id:
        sys.exit("缺少 NOTION_LOG_DB_ID。")
    page_id = upsert(notion, log_id, today, command, properties)
    print(f"已写入 {page_id}")


def plain_prop(value: dict) -> str:
    if "title" in value:
        return value["title"][0]["text"]["content"]
    if "rich_text" in value:
        return value["rich_text"][0]["text"]["content"]
    if "select" in value:
        return value["select"]["name"]
    if "date" in value:
        return value["date"]["start"]
    return ""


def self_check() -> None:
    """不联网。锁住过期判断和失败兜底这两条。"""
    today = date(2026, 10, 22)
    rows = [
        {"name": "旧票", "last": "2026-10-14"},
        {"name": "边界", "last": "2026-10-15"},
        {"name": "新票", "last": "2026-10-21"},
        {"name": "没点过", "last": ""},
    ]
    got = stale_names(rows, today)
    assert got == ["旧票", "没点过"], got
    assert clip("") == PENDING
    assert code6("300853 申昊科技") == "300853"
    assert code6("300853.SZ") == "300853"
    print("self-check ok")


def main() -> None:
    parser = argparse.ArgumentParser(description="写入一条看盘日志，客观字段自动填，主观字段留空。")
    parser.add_argument("command", choices=["preopen", "midday", "close", "week", "self-check"])
    parser.add_argument("--dry-run", action="store_true", help="只打印将写入的客观字段")
    args = parser.parse_args()
    if args.command == "self-check":
        self_check()
        return
    try:
        run(args.command, args.dry_run)
    except Exception as exc:  # 写入 Notion 失败要看得见；行情失败已在各自函数里吞掉
        print(f"写入失败：{exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
