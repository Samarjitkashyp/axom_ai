"""
Deterministic PDF operations built on PyMuPDF (no ML needed):
merge, split, compress, rotate, delete/extract pages, page numbers,
watermark, protect (password) and unlock (remove password).

Page specs are 1-based and accept ranges: "1,3,5-7".
"""
import zipfile

import pymupdf


def _parse_pages(spec, n):
    """'1,3,5-7' -> set of 0-based page indices within [0, n)."""
    out = set()
    for part in str(spec or '').split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part:
            a, b = part.split('-', 1)
            try:
                for x in range(int(a), int(b) + 1):
                    out.add(x - 1)
            except ValueError:
                continue
        else:
            try:
                out.add(int(part) - 1)
            except ValueError:
                continue
    return {x for x in out if 0 <= x < n}


def merge_pdfs(paths, out):
    doc = pymupdf.open()
    try:
        for p in paths:
            with pymupdf.open(p) as src:
                doc.insert_pdf(src)
        doc.save(out, garbage=4, deflate=True)
    finally:
        doc.close()
    return out


def split_pdf(path, out_prefix):
    """Each page -> its own single-page PDF. Returns the list of file paths."""
    src = pymupdf.open(path)
    paths = []
    try:
        for i in range(len(src)):
            d = pymupdf.open()
            d.insert_pdf(src, from_page=i, to_page=i)
            o = f"{out_prefix}_p{i + 1}.pdf"
            d.save(o)
            d.close()
            paths.append(o)
    finally:
        src.close()
    return paths


def delete_pages(path, spec, out):
    doc = pymupdf.open(path)
    try:
        for i in sorted(_parse_pages(spec, len(doc)), reverse=True):
            doc.delete_page(i)
        if len(doc) == 0:
            raise ValueError("That would delete every page.")
        doc.save(out, garbage=4, deflate=True)
    finally:
        doc.close()
    return out


def extract_pages(path, spec, out):
    src = pymupdf.open(path)
    try:
        keep = sorted(_parse_pages(spec, len(src)))
        if not keep:
            raise ValueError("No valid pages selected.")
        d = pymupdf.open()
        for i in keep:
            d.insert_pdf(src, from_page=i, to_page=i)
        d.save(out)
        d.close()
    finally:
        src.close()
    return out


def rotate_pdf(path, angle, out, spec=None):
    doc = pymupdf.open(path)
    try:
        pages = _parse_pages(spec, len(doc)) if spec else set(range(len(doc)))
        for i in pages:
            doc[i].set_rotation((doc[i].rotation + int(angle)) % 360)
        doc.save(out, garbage=4, deflate=True)
    finally:
        doc.close()
    return out


def compress_pdf(path, out):
    doc = pymupdf.open(path)
    try:
        doc.save(out, garbage=4, deflate=True, clean=True)
    finally:
        doc.close()
    return out


def add_page_numbers(path, out):
    doc = pymupdf.open(path)
    try:
        for i, page in enumerate(doc):
            r = page.rect
            page.insert_text((r.width / 2 - 6, r.height - 22), str(i + 1),
                             fontsize=10, color=(0.35, 0.35, 0.35))
        doc.save(out)
    finally:
        doc.close()
    return out


def _load_font(size):
    from PIL import ImageFont
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
              'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/arial.ttf'):
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def watermark_pdf(path, text, out, opacity=0.15, size=48, color='#888888',
                  rotation=45, position='diagonal'):
    """
    Canva-style watermark: builds a transparent PNG stamp of the text (colour,
    opacity, font-size, rotation) and overlays it — centred, diagonal, or tiled
    across every page.
    """
    import io
    from PIL import Image, ImageDraw

    try:
        opacity = float(opacity)
    except (TypeError, ValueError):
        opacity = 0.15
    try:
        size = int(size)
    except (TypeError, ValueError):
        size = 48
    c = (color or '#888888').lstrip('#')
    if len(c) != 6:
        c = '888888'
    rgb = (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16))
    alpha = max(0, min(255, int(opacity * 255)))
    text = (text or 'CONFIDENTIAL')

    # 1. render the text to a transparent PNG stamp
    font = _load_font(size)
    tmp = Image.new('RGBA', (10, 10))
    bbox = ImageDraw.Draw(tmp).textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = max(12, size // 3)
    stamp = Image.new('RGBA', (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(stamp).text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=rgb + (alpha,))
    if position in ('diagonal', 'tile') and rotation:
        stamp = stamp.rotate(float(rotation), expand=True, resample=Image.BICUBIC)
    buf = io.BytesIO(); stamp.save(buf, 'PNG'); png = buf.getvalue()
    sw, sh = stamp.size

    doc = pymupdf.open(path)
    try:
        for page in doc:
            pr = page.rect
            if position == 'tile':
                step_x, step_y = sw * 1.15, sh * 1.5
                y = 0
                while y < pr.height:
                    x = 0
                    while x < pr.width:
                        page.insert_image(pymupdf.Rect(x, y, x + sw, y + sh), stream=png, overlay=True)
                        x += step_x
                    y += step_y
            else:
                if position == 'top':
                    cy = min(pr.height * 0.12, sh)
                elif position == 'bottom':
                    cy = pr.height - sh / 2 - 12
                else:  # center / diagonal
                    cy = pr.height / 2
                cx = pr.width / 2
                # scale down if the stamp is wider than the page
                scale = min(1.0, (pr.width - 20) / sw)
                w, h = sw * scale, sh * scale
                page.insert_image(pymupdf.Rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2),
                                  stream=png, overlay=True)
        doc.save(out)
    finally:
        doc.close()
    return out


def remove_watermark(path, out):
    """
    Best-effort watermark removal: deletes annotations and images that repeat on
    EVERY page (typical logo/stamp watermarks). Cannot remove text baked into the
    page content without also removing real content.
    """
    doc = pymupdf.open(path)
    try:
        page_imgs = []
        for page in doc:
            try:
                page_imgs.append({img[0] for img in page.get_images(full=True)})
            except Exception:
                page_imgs.append(set())
        common = set.intersection(*page_imgs) if len(page_imgs) > 1 and all(page_imgs) else set()

        for page in doc:
            # 1. drop annotations (stamp/watermark annots)
            try:
                for annot in list(page.annots() or []):
                    page.delete_annot(annot)
            except Exception:
                pass
            # 2. redact repeating (watermark) images
            for img in page.get_images(full=True):
                if img[0] in common:
                    try:
                        for rect in page.get_image_rects(img[0]):
                            page.add_redact_annot(rect)
                    except Exception:
                        pass
            try:
                page.apply_redactions()
            except Exception:
                pass
        doc.save(out, garbage=4, deflate=True)
    finally:
        doc.close()
    return out


def protect_pdf(path, password, out):
    """Encrypt with a password (AES-256)."""
    doc = pymupdf.open(path)
    try:
        perm = int(
            pymupdf.PDF_PERM_ACCESSIBILITY | pymupdf.PDF_PERM_PRINT
            | pymupdf.PDF_PERM_COPY | pymupdf.PDF_PERM_ANNOTATE)
        doc.save(out, encryption=pymupdf.PDF_ENCRYPT_AES_256,
                 owner_pw=password, user_pw=password, permissions=perm)
    finally:
        doc.close()
    return out


def unlock_pdf(path, password, out):
    """Remove password protection (needs the current password)."""
    doc = pymupdf.open(path)
    try:
        if doc.needs_pass and not doc.authenticate(password or ''):
            raise ValueError("Wrong password — cannot unlock this PDF.")
        doc.save(out)
    finally:
        doc.close()
    return out


def zip_files(file_paths, out_zip):
    import os
    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for p in file_paths:
            zf.write(p, arcname=os.path.basename(p))
    return out_zip
