from pathlib import Path
from datetime import datetime, timezone
import json,time
BASE=Path("/var/lib/soniks-client/data")
STORE=Path("/var/lib/yl3gbc-journal")
STATE=STORE/"state.json"
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
    return {"last_seen":now(),"decoded_packets":sum(x.name.startswith("data_") for x in files),"files":len(files),"bytes":sum(x.stat().st_size for x in files),"metadata":meta}
state=load()
while True:
    out=BASE/"output"; current={x.name:x for x in out.iterdir() if x.is_dir()} if out.is_dir() else {}
    for oid,d in current.items(): state[oid]={"first_seen":state.get(oid,{}).get("first_seen",now()),**snap(d)}
    for oid in list(state):
        if oid not in current:
            state[oid]["finished"]=now(); state[oid]["status"]="incomplete" if (BASE/"incomplete"/oid).is_dir() else "complete" if (BASE/"complete"/oid).is_dir() else "sent"
            q=STORE/f'{state[oid]["finished"][:10]}.jsonl'; STORE.mkdir(parents=True,exist_ok=True)
            with q.open("a",encoding="utf-8") as f: f.write(json.dumps({"observation_id":oid,**state[oid]},ensure_ascii=False)+"\n")
            del state[oid]
    save(state); time.sleep(2)
