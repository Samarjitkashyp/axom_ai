# Axom AI Assamese voice (axom-tts)

AI4Bharat Indic-TTS (FastPitch + HiFi-GAN, MIT licence) as a small local service. The Django view `axom_ai/tts_api.py` (`POST /api/tts/speak/`) is its only caller; the chat's 🔊 button uses it.

* Runs as its own system user `tts` (home `/srv/axom-tts`), which cannot read the site's `.env`, keys or database.
* Listens on `127.0.0.1:8090` only. One sentence at a time (the server has 2 CPU cores), a queue of 6, then `503`. Each sentence is made once and kept in `/srv/axom-tts/cache`.
* Systemd: `axom-tts.service` (Nice=10, CPUWeight=50, MemoryMax=2.5G).

## Set-up (what was done on the server)
```bash
sudo useradd --system --create-home --home-dir /srv/axom-tts --shell /usr/sbin/nologin tts
# model: github.com/AI4Bharat/Indic-TTS release v1-checkpoints-release, as.zip (1.4 GB) -> unzip to /srv/axom-tts/models/as
sudo -u tts python3 -m venv /srv/axom-tts/venv
sudo -u tts /srv/axom-tts/venv/bin/pip install torch==2.11.0 torchaudio==2.11.0 --index-url https://download.pytorch.org/whl/cpu
sudo -u tts /srv/axom-tts/venv/bin/pip install "coqui-tts[codec]" "transformers<5" soundfile fastapi "uvicorn[standard]"
sudo -u tts /srv/axom-tts/venv/bin/python slim_checkpoints.py            # best_model.pth -> slim_model.pth (a third of the size)
sudo install -o tts -g tts -m 644 tts_service.py /srv/axom-tts/app/tts_service.py
sudo install -m 644 axom-tts.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now axom-tts
```
`test_prepare.py` checks the text clean-up: `sudo -u tts /srv/axom-tts/venv/bin/python test_prepare.py`.

## Notes
* Change `VERSION` in `tts_service.py` when the voice, speed or text rules change: the cache starts again.
* Numbers are read digit by digit and English letters are skipped (the model has neither digits nor Latin letters).
* Admin panel > System Settings > "Assamese voice in the chat": on/off and the daily limits (a sentence that is already made is free to replay).
