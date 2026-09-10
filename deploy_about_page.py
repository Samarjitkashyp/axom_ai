import subprocess
import tarfile
import io
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY_PATH = "E:/aws-intansec/Nginx-5/LightsailDefaultKey-ap-south-1 (1).pem"
HOST = "admin@3.6.237.64"
SSH_CMD = ["ssh", "-o", "StrictHostKeyChecking=no", "-i", KEY_PATH, HOST]

print("Preparing tar archive of About Page & SEO/GEO/AEO updates...")
tar_buffer = io.BytesIO()

files_to_sync = [
    ("templates/about.html", "templates/about.html"),
    ("axom_ai/views.py", "axom_ai/views.py"),
    ("axom_ai/urls.py", "axom_ai/urls.py"),
    ("templates/landing.html", "templates/landing.html"),
    ("templates/faq.html", "templates/faq.html"),
    ("templates/blog_list.html", "templates/blog_list.html"),
    ("templates/blog_detail.html", "templates/blog_detail.html"),
    ("next-frontend/app/about/page.tsx", "next-frontend/app/about/page.tsx"),
    ("next-frontend/components/Navbar.tsx", "next-frontend/components/Navbar.tsx"),
    ("next-frontend/components/Footer.tsx", "next-frontend/components/Footer.tsx"),
    ("next-frontend/app/sitemap.ts", "next-frontend/app/sitemap.ts"),
]

with tarfile.open(fileobj=tar_buffer, mode="w:gz") as tar:
    for local_rel, arcname in files_to_sync:
        local_path = os.path.join(r"f:\axom_ai", local_rel)
        if os.path.exists(local_path):
            tar.add(local_path, arcname=arcname)
            print(f"Added: {arcname}")
        else:
            print(f"Skipped (not found): {local_path}")

tar_buffer.seek(0)
tar_bytes = tar_buffer.read()
print(f"\nUploading archive ({len(tar_bytes)} bytes) to {HOST}...")

upload_proc = subprocess.run(
    SSH_CMD + ["tar -xzf - -C /home/admin/axom_ai/"],
    input=tar_bytes,
    capture_output=True
)

if upload_proc.returncode != 0:
    print(f"ERROR: Unpack failed with code {upload_proc.returncode}")
    print(upload_proc.stderr.decode('utf-8', errors='replace'))
    sys.exit(1)

print("Archive unpacked successfully on server.")

remote_commands = """
sudo systemctl restart axom.service
sleep 1
sudo systemctl is-active axom.service
echo "=== AXOM AI ABOUT PAGE & SEO UPDATE DEPLOYED SUCCESSFULLY ==="
"""

print("Executing server restart commands...")
exec_proc = subprocess.run(
    SSH_CMD + [remote_commands],
    capture_output=True,
    text=True,
    encoding='utf-8',
    errors='replace'
)

print(exec_proc.stdout)
if exec_proc.stderr:
    print("STDERR:", exec_proc.stderr)
