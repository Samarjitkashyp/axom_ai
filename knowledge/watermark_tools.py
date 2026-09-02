"""
Watermark detection + region-based removal for the visual Remove-Watermark editor.

- detect_watermark(path): heuristics (repeating images, annotations, optional-content
  layers, rotated/diagonal text) -> {found, reasons, pages, suspects}. `suspects`
  are normalised [x0,y0,x1,y1] boxes per page so the editor can pre-highlight them.
- remove_watermark_regions(path, out, regions, mode): the user's boxes (normalised)
  are removed either by white-out ('white', keeps text) or content-aware inpaint
  ('inpaint', rasterises the page and reconstructs the background with OpenCV).
"""
import pymupdf


def _norm_rect(r, pr):
    return [r.x0 / pr.width, r.y0 / pr.height, r.x1 / pr.width, r.y1 / pr.height]


def detect_watermark(path):
    doc = pymupdf.open(path)
    try:
        n = len(doc)
        reasons = []
        suspects = {}

        # 1. images repeating on every page (logo / stamp watermark)
        page_imgs = []
        for page in doc:
            try:
                page_imgs.append({img[0] for img in page.get_images(full=True)})
            except Exception:
                page_imgs.append(set())
        common = set.intersection(*page_imgs) if n > 1 and all(page_imgs) else set()
        if common:
            reasons.append(f"{len(common)} image(s) repeat on every page — likely a logo/stamp watermark")

        # 2. annotations
        annot_pages = 0
        for page in doc:
            try:
                if page.first_annot:
                    annot_pages += 1
            except Exception:
                pass
        if annot_pages:
            reasons.append(f"annotations on {annot_pages} page(s)")

        # 3. optional-content (layer) watermark
        try:
            ocgs = doc.get_ocgs() or {}
            if any('water' in str(v.get('name', '')).lower() for v in ocgs.values()):
                reasons.append("a 'watermark' layer (optional content) is present")
        except Exception:
            pass

        # 4. rotated / diagonal text (classic text watermark) + collect suspect boxes
        rotated_text = 0
        transp_imgs = 0
        for i, page in enumerate(doc):
            pr = page.rect
            page_area = max(1.0, pr.width * pr.height)
            rects = []
            # images: repeating across pages OR semi-transparent overlays -> suspects
            for img in page.get_images(full=True):
                xref, smask = img[0], img[1]
                is_repeat = xref in common
                is_transp = bool(smask)
                if is_repeat or is_transp:
                    try:
                        for r in page.get_image_rects(xref):
                            if is_transp and (r.width * r.height) / page_area < 0.03:
                                continue  # tiny transparent image -> probably an icon, skip
                            rects.append(_norm_rect(r, pr))
                            if is_transp and not is_repeat:
                                transp_imgs += 1
                    except Exception:
                        pass
            # rotated text spans -> suspects
            try:
                d = page.get_text('dict')
                for block in d.get('blocks', []):
                    for line in block.get('lines', []):
                        dirx, diry = line.get('dir', (1.0, 0.0))
                        if abs(diry) > 0.08:  # not horizontal -> likely watermark text
                            rotated_text += 1
                            x0, y0, x1, y1 = line['bbox']
                            rects.append([x0 / pr.width, y0 / pr.height, x1 / pr.width, y1 / pr.height])
            except Exception:
                pass
            if rects:
                suspects[str(i)] = rects
        if rotated_text:
            reasons.append(f"{rotated_text} rotated/diagonal text line(s) — a text watermark")
        if transp_imgs:
            reasons.append(f"{transp_imgs} semi-transparent overlay image(s) — a likely watermark/stamp")

        return {'found': bool(reasons), 'reasons': reasons, 'pages': n, 'suspects': suspects}
    finally:
        doc.close()


def remove_watermark_regions(path, out, regions, mode='inpaint'):
    """regions: { "<page_index>": [[x0,y0,x1,y1], ...] } in 0..1 coords."""
    doc = pymupdf.open(path)
    try:
        def boxes_for(i):
            return regions.get(str(i)) or regions.get(i) or []

        if mode == 'white':
            for i, page in enumerate(doc):
                pr = page.rect
                for b in boxes_for(i):
                    r = pymupdf.Rect(b[0] * pr.width, b[1] * pr.height, b[2] * pr.width, b[3] * pr.height)
                    page.draw_rect(r, color=None, fill=(1, 1, 1), overlay=True)
            doc.save(out, garbage=4, deflate=True)
            return out

        # inpaint mode: rasterise -> mask -> cv2.inpaint -> rebuild
        import cv2
        import numpy as np
        result = pymupdf.open()
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=150)
            arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
            rgb = arr[:, :, :3].copy()
            mask = np.zeros((pix.height, pix.width), np.uint8)
            for b in boxes_for(i):
                x0 = max(0, int(b[0] * pix.width)); y0 = max(0, int(b[1] * pix.height))
                x1 = min(pix.width, int(b[2] * pix.width)); y1 = min(pix.height, int(b[3] * pix.height))
                if x1 > x0 and y1 > y0:
                    cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
            if mask.any():
                bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
                bgr = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)
                rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            ok, buf = cv2.imencode('.jpg', cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
            npage = result.new_page(width=page.rect.width, height=page.rect.height)
            npage.insert_image(npage.rect, stream=buf.tobytes())
        result.save(out, garbage=4, deflate=True, deflate_images=True)
        result.close()
        return out
    finally:
        doc.close()
