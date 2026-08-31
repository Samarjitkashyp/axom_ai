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


def watermark_pdf(path, text, out):
    doc = pymupdf.open(path)
    try:
        for page in doc:
            r = page.rect
            # Big, light, centred watermark across each page.
            page.insert_textbox(
                pymupdf.Rect(0, r.height / 2 - 40, r.width, r.height / 2 + 40),
                text, fontsize=44, color=(0.8, 0.8, 0.8), align=1, overlay=True)
        doc.save(out)
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
