"""
Deterministic file-format conversions (no ML / no external API needed):

  PDF  -> Word (.docx)   via pdf2docx     (keeps layout, text, tables)
  PNG/JPG -> PDF          via img2pdf       (lossless, one image per page)
  PDF  -> PNG / JPG       via PyMuPDF       (renders each page to an image)

DOCX/TXT -> PDF lives in doc_converter.py (ReportLab). These are all done with
purpose-built libraries — the right tool for exact, high-fidelity conversion.
"""
import os
import zipfile


def convert_pdf_to_docx(input_pdf, output_docx):
    """PDF -> editable Word document. Preserves text, layout and tables."""
    from pdf2docx import Converter
    cv = Converter(input_pdf)
    try:
        cv.convert(output_docx)  # all pages
    finally:
        cv.close()
    return output_docx


def convert_images_to_pdf(image_paths, output_pdf):
    """One or more PNG/JPG images -> a single PDF (one image per page, lossless)."""
    import img2pdf
    from PIL import Image

    clean = []
    tmp_made = []
    for p in image_paths:
        try:
            im = Image.open(p)
            # img2pdf rejects alpha/palette modes — flatten those to RGB JPEG.
            if im.mode in ('RGBA', 'LA', 'P'):
                rgb = im.convert('RGB')
                tmp = f"{p}.rgb.jpg"
                rgb.save(tmp, 'JPEG', quality=95)
                clean.append(tmp)
                tmp_made.append(tmp)
            else:
                clean.append(p)
        except Exception:
            clean.append(p)

    try:
        with open(output_pdf, 'wb') as f:
            f.write(img2pdf.convert(clean))
    finally:
        for t in tmp_made:
            try:
                os.remove(t)
            except Exception:
                pass
    return output_pdf


def convert_pdf_to_images(input_pdf, output_prefix, fmt='png', dpi=150):
    """PDF -> a list of image files (one per page) at the given DPI.
    Returns the list of created image paths."""
    import pymupdf

    fmt = 'jpg' if fmt.lower() in ('jpg', 'jpeg') else 'png'
    zoom = max(72, min(int(dpi), 300)) / 72.0
    mat = pymupdf.Matrix(zoom, zoom)

    doc = pymupdf.open(input_pdf)
    paths = []
    try:
        for i, page in enumerate(doc):
            pix = page.get_pixmap(matrix=mat)  # no alpha -> safe for JPEG
            out = f"{output_prefix}_p{i + 1}.{fmt}"
            pix.save(out)  # PyMuPDF picks the encoder from the extension
            paths.append(out)
    finally:
        doc.close()
    return paths


def zip_files(file_paths, output_zip):
    """Bundle several files into one .zip (used when a PDF becomes many images)."""
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for p in file_paths:
            zf.write(p, arcname=os.path.basename(p))
    return output_zip


def office_available():
    """True if LibreOffice (soffice) is installed (server only)."""
    import shutil
    return shutil.which('soffice') is not None or shutil.which('libreoffice') is not None


def convert_office_to_pdf(input_path, out_dir):
    """
    Office/OpenDocument/HTML/EPUB -> PDF via headless LibreOffice.
    Handles DOCX, DOC, PPTX, PPT, XLSX, XLS, ODT, ODP, ODS, RTF, HTML, EPUB, CSV.
    Returns the produced PDF path.
    """
    import shutil
    import subprocess
    import uuid
    soffice = shutil.which('soffice') or shutil.which('libreoffice')
    if not soffice:
        raise RuntimeError("LibreOffice is not installed on this machine.")

    # A unique profile dir avoids clashes between concurrent conversions.
    profile = f"/tmp/lo_profile_{uuid.uuid4().hex[:8]}"
    cmd = [
        soffice, '--headless', '--norestore',
        f'-env:UserInstallation=file://{profile}',
        '--convert-to', 'pdf', '--outdir', out_dir, input_path,
    ]
    subprocess.run(cmd, check=True, timeout=180, capture_output=True)

    base = os.path.splitext(os.path.basename(input_path))[0]
    out = os.path.join(out_dir, base + '.pdf')
    if not os.path.exists(out):
        raise RuntimeError("LibreOffice did not produce a PDF (unsupported or corrupt file).")
    return out


def compress_pdf_gs(input_path, out_pdf, level='moderate'):
    """
    Real PDF compression via Ghostscript (downsamples/recompresses images).
    level: 'basic' (light, 300dpi), 'moderate' (150dpi), 'strong' (72dpi, smallest).
    """
    import shutil
    import subprocess
    gs = shutil.which('gs')
    if not gs:
        raise RuntimeError("Ghostscript is not installed on this machine.")
    preset = {'basic': '/printer', 'moderate': '/ebook', 'strong': '/screen'}.get(level, '/ebook')
    cmd = [gs, '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5',
           f'-dPDFSETTINGS={preset}', '-dNOPAUSE', '-dQUIET', '-dBATCH',
           '-dDetectDuplicateImages=true', '-dCompressFonts=true',
           f'-sOutputFile={out_pdf}', input_path]
    subprocess.run(cmd, check=True, timeout=300, capture_output=True)
    return out_pdf


def ocr_pdf(input_path, out_pdf, langs='eng+asm+hin'):
    """
    Make a scanned PDF searchable (adds a text layer) via ocrmypdf + Tesseract.
    Supports English, Assamese and Hindi. Returns the searchable PDF path.
    """
    import shutil
    import subprocess
    if not shutil.which('ocrmypdf'):
        raise RuntimeError("ocrmypdf is not installed on this machine.")
    cmd = ['ocrmypdf', '--force-ocr', '-l', langs,
           '--optimize', '1', input_path, out_pdf]
    subprocess.run(cmd, check=True, timeout=600, capture_output=True)
    return out_pdf
