#!/bin/bash
# =============================================================================
# Axom AI — one-shot deployment script for AWS Lightsail (Bitnami / Ubuntu)
# Run this ON THE SERVER (via Lightsail browser SSH):
#   1. Edit the three values in the CONFIG block below.
#   2. bash deploy.sh
# App will be live at:  http://<STATIC_IP>:8000
# =============================================================================
set -e

# ============================ CONFIG — EDIT THESE ============================
GEMINI_API_KEY="PASTE_YOUR_GEMINI_KEY_HERE"
DB_PASSWORD="ChangeThisStrongPassword123"
STATIC_IP="3.6.237.64"
# ============================================================================

REPO="https://github.com/Samarjitkashyp/axom_ai.git"
APP_DIR="$HOME/axom_ai"
SECRET_KEY="$(openssl rand -hex 32)"

echo ">>> [1/8] Add 2GB swap (protects 1GB RAM from crashing)..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo ">>> [2/8] Install system packages..."
sudo apt-get update -y
sudo apt-get install -y python3-venv python3-pip python3-dev libpq-dev postgresql postgresql-contrib git build-essential

echo ">>> [3/8] Set up PostgreSQL database + user..."
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE DATABASE axom_ai;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER axom_user WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER axom_user WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "ALTER ROLE axom_user SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER DATABASE axom_ai OWNER TO axom_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE axom_ai TO axom_user;"

echo ">>> [4/8] Clone / update the repo..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo ">>> [5/8] Python venv + dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [6/8] Write production .env..."
cat > .env <<EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=${STATIC_IP},localhost,127.0.0.1
DB_NAME=axom_ai
DB_USER=axom_user
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=localhost
DB_PORT=5432
GEMINI_API_KEY=${GEMINI_API_KEY}
USE_LOCAL_LLM=False
EOF

echo ">>> [7/8] Migrate + collect static files..."
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo ">>> [8/8] Create + start Gunicorn service..."
sudo tee /etc/systemd/system/axom.service >/dev/null <<EOF
[Unit]
Description=Axom AI (Gunicorn)
After=network.target postgresql.service

[Service]
User=$(whoami)
WorkingDirectory=${APP_DIR}
ExecStart=${APP_DIR}/venv/bin/gunicorn --workers 1 --timeout 120 --bind 0.0.0.0:8000 axom_ai.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable axom
sudo systemctl restart axom

echo ""
echo "==================================================================="
echo " DONE!  App is live at:  http://${STATIC_IP}:8000"
echo ""
echo " Next — create your admin login:"
echo "   cd ${APP_DIR} && source venv/bin/activate && python manage.py createsuperuser"
echo ""
echo " Check status / logs:"
echo "   sudo systemctl status axom"
echo "   sudo journalctl -u axom -n 50 --no-pager"
echo "==================================================================="
