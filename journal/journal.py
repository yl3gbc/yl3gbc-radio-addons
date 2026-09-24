from pathlib import Path
from datetime import datetime, timezone
import json,time,re
BASE=Path("/var/lib/soniks-client/data")
STORE=Path("/var/lib/yl3gbc-journal")
STATE=STORE/"state.json"
LOG=BASE.parent/"logs"/"client.log"
def now(): return datetime.now(timezone.utc).isoformat()
def load():
    try: return json.loads(STATE.read_text())
    except (OSError,json.JSONDecodeError): return {}
def save(x): STORE.mkdir(parents=True,exist_ok=True); STATE.write_text(json.dumps(x,ensure_ascii=False))
def snap(d):
    files=[x for x in d.iterdir() if x.is_file()]
    meta={}
    for x in files:
        if x.name.startswith("metadata_"):
            try: meta=json.loads(x.read_text(errors="replace"))
            except (OSError,json.JSONDecodeError): pass
    return {"last_seen":now(),"packet_files":[x.name for x in files if x.name.startswith("data_")],"decoded_packets":sum(x.name.startswith("data_") for x in files),"files":len(files),"bytes":sum(x.stat().st_size for x in files),"metadata":meta}
def scanlog(active):
    if not LOG.exists(): return
    pos=state.get("_log_pos",0); pos=pos if pos<=LOG.stat().st_size else 0
    packets=state.setdefault("_packets",{})
    with LOG.open("r",encoding="utf-8",errors="replace") as f:
        f.seek(pos)
        for line in f:
            m=re.search(r"/output/(\d+)/(data_[^\s]+)",line)
            if m and m.group(1) in active:
                xs=packets.setdefault(m.group(1),[])
                if m.group(2) not in xs: xs.append(m.group(2))
        state["_log_pos"]=f.tell()
state=load()
while True:
    out=BASE/"output"; current={x.name:x for x in out.iterdir() if x.is_dir()} if out.is_dir() else {}
    active=set(current)|{x for x in state if not x.startswith("_")}; scanlog(active)
    for oid,d in current.items():
        old=state.get(oid,{})
        rec={"first_seen":old.get("first_seen",now()),**snap(d)}
        seen=set(old.get("packet_files",[]))|set(rec["packet_files"])|set(state.get("_packets",{}).get(oid,[]))
        rec["packet_files"]=sorted(seen); rec["decoded_packets"]=len(seen); state[oid]=rec
    for oid in [x for x in list(state) if not x.startswith("_")]:
        if oid not in current:
            state[oid]["finished"]=now(); state[oid]["status"]="incomplete" if (BASE/"incomplete"/oid).is_dir() else "complete" if (BASE/"complete"/oid).is_dir() else "sent"
            q=STORE/f'{state[oid]["finished"][:10]}.jsonl'; STORE.mkdir(parents=True,exist_ok=True)
            with q.open("a",encoding="utf-8") as f: f.write(json.dumps({"observation_id":oid,**state[oid]},ensure_ascii=False)+"\n")
            state.get("_packets",{}).pop(oid,None); del state[oid]
    save(state); time.sleep(2)
