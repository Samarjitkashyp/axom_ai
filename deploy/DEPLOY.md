# 🚀 Axom AI — AWS Lightsail Deployment (Hindi Guide)

Yeh guide tumhare Lightsail instance **Nginx-2 (3.6.237.64)** pe Axom AI deploy karne ke liye hai.

- Access: **http://3.6.237.64:8000**
- Mode: **Gemini-only** (1GB RAM pe Ollama nahi chalta)
- Static files: WhiteNoise serve karta hai (nginx config ki zaroorat nahi)

---

## Step 1 — Firewall me port 8000 kholo
Lightsail console → **Nginx-2** → **Networking** tab → **IPv4 Firewall** → **+ Add rule**:
- Application: **Custom**
- Protocol: **TCP**
- Port: **8000**
- Save

(Ya ye ho chuka hai to skip.)

## Step 2 — Server me login karo
Lightsail console → **Nginx-2** → orange **"Connect using SSH"** button → browser terminal khulega.

## Step 3 — Deploy script download karo
Terminal me:
```bash
curl -O https://raw.githubusercontent.com/Samarjitkashyp/axom_ai/main/deploy/deploy.sh
```

## Step 4 — Apni details bharo
Script me 3 values edit karo:
```bash
nano deploy.sh
```
Inhe badlo (arrow keys se jao, edit karo):
- `GEMINI_API_KEY="..."` — apni Gemini key (https://aistudio.google.com/apikey)
- `DB_PASSWORD="..."` — koi strong password
- `STATIC_IP="3.6.237.64"` — already sahi hai

Save: `Ctrl+O` → Enter → `Ctrl+X`

## Step 5 — Chalao
```bash
bash deploy.sh
```
Yeh sab kuch apne aap karega (~5-10 min): packages, database, code, gunicorn.

## Step 6 — Admin login banao
```bash
cd ~/axom_ai && source venv/bin/activate && python manage.py createsuperuser
```
Username + password do.

## Step 7 — Kholo browser me 🎉
```
http://3.6.237.64:8000
```
- Chat: `/`
- Admin panel: `/admin-panel/`

---

## 🩺 Kuch gadbad ho to

**App nahi khul raha:**
```bash
sudo systemctl status axom
sudo journalctl -u axom -n 50 --no-pager
```

**Code update karke re-deploy:**
```bash
cd ~/axom_ai && git pull && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py collectstatic --noinput
sudo systemctl restart axom
```

**Restart:** `sudo systemctl restart axom`

---

## 🔒 Baad me (optional) — clean URL (port 80, HTTPS)
Abhi `:8000` pe hai. Baad me domain + HTTPS chahiye to Nginx reverse-proxy + Let's Encrypt setup kar sakte ho — bata dena, guide de dunga.
