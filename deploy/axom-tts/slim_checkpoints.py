"""Cut the checkpoints down to what is needed to speak (the downloads also hold optimizer states and the GAN discriminator):
less memory and a much faster start. Run as the tts user."""
import os
import torch

M = "/srv/axom-tts/models/as"
for sub in ("fastpitch", "hifigan"):
    src = "%s/%s/best_model.pth" % (M, sub)
    dst = "%s/%s/slim_model.pth" % (M, sub)
    ck = torch.load(src, map_location="cpu", weights_only=False)
    print(sub, "keys:", list(ck.keys()))
    keep = {"model": ck["model"]}
    if "config" in ck:
        keep["config"] = ck["config"]
    torch.save(keep, dst)
    print(sub, "%d MB -> %d MB" % (os.path.getsize(src) // 1048576, os.path.getsize(dst) // 1048576))
