# Ieraksta Docker Hub aprakstu repozitorijam yl3gbc/soniks-monitor:
#   īsais apraksts  — rinda SHORT zemāk;
#   pilnais apraksts — fails dockerhub-overview.md šajā mapē.
# Tokenu ņem no tā, ko saglabāja `docker login` (neko neprasa).
# Palaišana no šīs mapes:
#   uv run --no-project python dockerhub-overview.py
import base64
import json
import subprocess
import urllib.request
from pathlib import Path

HUB = "https://hub.docker.com/v2/"
REPO = HUB + "repositories/yl3gbc/soniks-monitor/"
SHORT = "SONIKS ground station web monitor / Веб-монитор станции SONIKS"
HERE = Path(__file__).resolve().parent
full = (HERE / "dockerhub-overview.md").read_text(encoding="utf-8")

# `docker login` saglabātais tokens. Tas ir vai nu paroļu programmā
# (credsStore), vai pašā config.json rindā "auth" — tur base64 formā
# "lietotājs:tokens". Atkodē tikai šeit, tokens netiek izdrukāts.
INDEX = "https://index.docker.io/v1/"
cfg = json.loads((Path.home() / ".docker/config.json").read_text())
store = cfg.get("credsStore")
if store:
    cmd = ["docker-credential-" + store, "get"]
    out = subprocess.run(cmd, input=INDEX.encode(),
                         capture_output=True, check=True)
    cred = json.loads(out.stdout)
else:
    auth = cfg.get("auths", {}).get(INDEX, {}).get("auth")
    if not auth:
        raise SystemExit("KĻŪDA: config.json nav Docker Hub ieraksta")
    user, _, secret = base64.b64decode(auth).decode().partition(":")
    cred = {"Username": user, "Secret": secret}


def req(url, data, method, jwt=None):
    h = {"Content-Type": "application/json"}
    if jwt:
        h["Authorization"] = "Bearer " + jwt
    body = json.dumps(data).encode()
    r = urllib.request.Request(url, body, h, method=method)
    return json.load(urllib.request.urlopen(r))


login = {"username": cred["Username"], "password": cred["Secret"]}
jwt = req(HUB + "users/login/", login, "POST")["token"]
data = {"description": SHORT, "full_description": full}
res = req(REPO, data, "PATCH", jwt)
print("OK" if res.get("full_description") == full else "KĻŪDA")
print(res.get("description"))
