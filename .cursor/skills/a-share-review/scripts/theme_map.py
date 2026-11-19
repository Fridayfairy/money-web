#!/usr/bin/env python3
"""把问财导出的涨停池整理成：当日读数、按故事归线、节点角色、mermaid 图谱。

只用标准库。输入是问财工具落盘的 JSON 文件（含 datas 数组）。
用法见 SKILL.md。规则只有两处会改结论：line-keywords.json 的归线顺序，和下面的角色定义。
"""
import argparse
import datetime
import json
import os
import re
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_KEYWORDS = os.path.join(HERE, "..", "references", "line-keywords.json")
TZ = datetime.timezone(datetime.timedelta(hours=8))


def pool_date(rows):
    for key in rows[0]:
        m = re.match(r"^涨停\[(\d{8})\]$", key) or re.match(r"^几天几板\[(\d{8})\]$", key)
        if m:
            return m.group(1)
    raise SystemExit("找不到涨停日期列，这个文件不是涨停池问句的结果")


def clock(value):
    s = str(value or "")
    if s.isdigit():
        return datetime.datetime.fromtimestamp(int(s) / 1000, TZ).strftime("%H:%M")
    return s[11:16] if len(s) >= 16 else ""


def boards(label):
    label = label or ""
    if label.startswith("首板"):
        return 1
    m = re.match(r"(\d+)天(\d+)板", label)
    return int(m.group(2)) if m else 1


def load_pool(path):
    data = json.load(open(path, encoding="utf-8"))
    rows = data["datas"]
    if data.get("row_count", len(rows)) > len(rows):
        sys.stderr.write(
            f"警告：{os.path.basename(path)} 只拿到 {len(rows)} 只，总数 {data['row_count']}。"
            "问财单页最多 80，要翻页，否则读数偏。\n"
        )
    day = pool_date(rows)
    out = []
    for r in rows:
        g = lambda k: r.get(f"{k}[{day}]")
        reason = g("涨停原因") or g("涨停原因类别") or ""
        prem = None
        for k, v in r.items():
            m = re.match(r"^涨跌幅\[(\d{8})\]$", k)
            if m and m.group(1) > day:
                prem = float(v)
        if prem is None and r.get("最新涨跌幅") is not None:
            prem = float(r["最新涨跌幅"])
        cap = g("流通市值") or g("a股市值(不含限售股)")
        out.append(
            dict(
                name=r["股票简称"],
                boards=boards(g("几天几板")),
                label=g("几天几板") or "首板涨停",
                first=clock(g("首次涨停时间")),
                opens=int(g("涨停开板次数") or 0),
                reason=reason,
                cap=float(cap) / 1e8 if cap else 0.0,
                seal=float(g("涨停封单额") or 0) / 1e8,
                prem=prem,
            )
        )
    return day, out


def classify(rows, keywords):
    lines = keywords["lines"]
    groups = {}
    for r in rows:
        hit = "其他"
        for ln in lines:
            if re.search(ln["reason"], r["reason"]) or (
                ln.get("name_also") and re.search(ln["name_also"], r["name"])
            ):
                hit = ln["name"]
                break
        r["line"] = hit
        groups.setdefault(hit, []).append(r)
    return groups


def assign_roles(members):
    top = max(m["boards"] for m in members)
    leader = sorted(
        [m for m in members if m["boards"] == top],
        key=lambda m: (m["first"] or "99:99", -m["seal"]),
    )[0]
    firsts = sorted(m["first"] for m in members if m["first"])
    median_first = firsts[len(firsts) // 2] if firsts else ""
    caps = sorted(m["cap"] for m in members)
    big_line = 5 * caps[len(caps) // 2]
    for m in members:
        if m is leader:
            m["role"] = "龙头"
        elif m["cap"] > 0 and m["cap"] >= big_line and len(members) >= 4:
            m["role"] = "中军"
        elif m["boards"] >= 2:
            m["role"] = "前排"
        elif m["first"] and m["first"] < median_first:
            m["role"] = "前排首板"
        else:
            m["role"] = "跟风"
    backup = None
    cands = [m for m in members if m is not leader and m["role"] in ("前排", "中军")]
    if cands:
        backup = sorted(cands, key=lambda m: (-m["boards"], -m["cap"]))[0]
    return leader, backup


def label(m):
    b = "首板" if m["boards"] == 1 else f"{m['boards']}板"
    return f"{m['name']} {b} {m['first']}"


def mermaid(line, members, leader, backup):
    ids = {id(m): f"n{i}" for i, m in enumerate(members)}
    out = ["flowchart TD", f'  head(["{line} {len(members)}只涨停"])']
    groups = {
        "front": ("前排", [m for m in members if m["role"] in ("前排", "前排首板")]),
        "follow": ("跟风", [m for m in members if m["role"] == "跟风"]),
    }
    out.append(f'  {ids[id(leader)]}["龙头 {label(leader)}"]')
    out.append(f"  head --> {ids[id(leader)]}")
    for m in [m for m in members if m["role"] == "中军"]:
        out.append(f'  {ids[id(m)]}["中军 {label(m)} 流通{m["cap"]:.0f}亿"]')
        out.append(f"  {ids[id(m)]} -.容量.-> {ids[id(leader)]}")
    prev = ids[id(leader)]
    for gid, (gname, ms) in groups.items():
        if not ms:
            continue
        ms = sorted(ms, key=lambda m: (-m["boards"], m["first"] or "99:99"))
        sid = f"g_{gid}"
        out.append(f"  subgraph {sid} [{gname}]")
        for m in ms[:12]:
            out.append(f'    {ids[id(m)]}["{label(m)}"]')
        if len(ms) > 12:
            out.append(f'    more_{gid}["另有 {len(ms) - 12} 只"]')
        out.append("  end")
        out.append(f"  {prev} --> {sid}")
        prev = sid
    if backup:
        out.append(f'  backup(["备用锚 {backup["name"]}"])')
        out.append(f"  {ids[id(leader)]} -.龙头断时接棒.-> backup")
    return "\n".join(out)


def summarize(day, rows, prev_rows, down, bomb, keywords, top):
    groups = classify(rows, keywords)
    res = {"日期": day, "涨停数": len(rows), "最高板": max(r["boards"] for r in rows)}
    if down is not None:
        res["跌停数"] = down
    if bomb is not None:
        res["炸板数"] = bomb
        res["炸板率"] = round(bomb / (len(rows) + bomb) * 100, 1)
    if prev_rows:
        prem = [r["prem"] for r in prev_rows if r["prem"] is not None]
        names = {r["name"] for r in rows}
        res["昨日涨停数"] = len(prev_rows)
        res["昨日涨停溢价中位数"] = round(statistics.median(prem), 2)
        res["昨日涨停溢价为正"] = sum(1 for p in prem if p > 0)
        res["昨日涨停今日再板"] = sum(1 for r in prev_rows if r["name"] in names)
    res["线"] = []
    for name, members in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        leader, backup = assign_roles(members)
        item = {
            "线": name,
            "涨停数": len(members),
            "最高板": leader["boards"],
            "龙头": leader["name"],
            "备用锚": backup["name"] if backup else None,
            "成员": [
                {k: m[k] for k in ("name", "role", "boards", "first", "opens", "cap", "seal")}
                for m in sorted(members, key=lambda m: (-m["boards"], m["first"] or "99:99"))
            ],
        }
        if prev_rows:
            pg = [r for r in prev_rows if classify_one(r, keywords) == name]
            pv = [r["prem"] for r in pg if r["prem"] is not None]
            item["昨日成员数"] = len(pg)
            item["昨日成员溢价中位数"] = round(statistics.median(pv), 2) if pv else None
        item["mermaid"] = mermaid(name, members, leader, backup) if name != "其他" else None
        res["线"].append(item)
    return res


def classify_one(r, keywords):
    for ln in keywords["lines"]:
        if re.search(ln["reason"], r["reason"]) or (
            ln.get("name_also") and re.search(ln["name_also"], r["name"])
        ):
            return ln["name"]
    return "其他"


def render(res, top):
    out = [f"## {res['日期']} 读数"]
    keys = ["涨停数", "最高板", "跌停数", "炸板数", "炸板率", "昨日涨停数", "昨日涨停溢价中位数", "昨日涨停溢价为正", "昨日涨停今日再板"]
    out.append("，".join(f"{k} {res[k]}" for k in keys if k in res))
    out.append("")
    for ln in res["线"]:
        extra = ""
        if "昨日成员数" in ln:
            extra = f"，昨日 {ln['昨日成员数']} 只，溢价中位数 {ln['昨日成员溢价中位数']}"
        out.append(f"### {ln['线']}：{ln['涨停数']} 只，最高 {ln['最高板']} 板，龙头 {ln['龙头']}，备用锚 {ln['备用锚']}{extra}")
        for m in ln["成员"]:
            out.append(f"- {m['role']} {m['name']} {m['boards']}板 {m['first']} 开板{m['opens']}次 流通{m['cap']:.0f}亿 封单{m['seal']:.2f}亿")
        out.append("")
    shown = 0
    for ln in res["线"]:
        if ln["mermaid"] and shown < top:
            out.append(f"```mermaid\n{ln['mermaid']}\n```\n")
            shown += 1
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pool", help="当日涨停池 JSON")
    ap.add_argument("--prev", help="前一日涨停池 JSON，含今日涨跌幅，用来算溢价和晋级")
    ap.add_argument("--down", type=int, help="当日跌停家数，取跌停问句的 row_count")
    ap.add_argument("--bomb", type=int, help="当日炸板家数，取炸板问句的 row_count")
    ap.add_argument("--keywords", default=DEFAULT_KEYWORDS)
    ap.add_argument("--top", type=int, default=3, help="输出几条线的图")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    keywords = json.load(open(args.keywords, encoding="utf-8"))
    day, rows = load_pool(args.pool)
    prev_rows = load_pool(args.prev)[1] if args.prev else None
    res = summarize(day, rows, prev_rows, args.down, args.bomb, keywords, args.top)
    print(json.dumps(res, ensure_ascii=False, indent=1) if args.json else render(res, args.top))


if __name__ == "__main__":
    main()
