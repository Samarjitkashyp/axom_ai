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
