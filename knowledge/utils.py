import os
import csv
from django.db.models import Q
from .models import KnowledgeDocument, KnowledgeChunk

def extract_text_from_file(file_path, file_type):
    """
    Extracts plain text and structured content from PDF, Excel, Image, or Text files.
    """
    text_content = ""
    file_type = file_type.lower()

    try:
        # PDF Extraction using pypdf
        if file_type == 'pdf' or file_path.endswith('.pdf'):
            import pypdf
            reader = pypdf.PdfReader(file_path)
            extracted_pages = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_pages.append(f"--- Page {i+1} ---\n{page_text}")
            text_content = "\n\n".join(extracted_pages)

        # Excel / CSV Extraction using openpyxl or csv
        elif file_type in ['excel', 'csv', 'xlsx', 'xls'] or file_path.endswith(('.xlsx', '.xls', '.csv')):
            if file_path.endswith('.csv'):
                with open(file_path, mode='r', encoding='utf-8', errors='ignore') as f:
                    reader = csv.reader(f)
                    rows = [", ".join(row) for row in reader if row]
                    text_content = "\n".join(rows)
            else:
                import openpyxl
                wb = openpyxl.load_workbook(file_path, data_only=True)
                sheet_data = []
                for sheet in wb.sheetnames:
                    ws = wb[sheet]
                    sheet_data.append(f"=== Sheet: {sheet} ===")
                    for row in ws.iter_rows(values_only=True):
                        row_vals = [str(val) for val in row if val is not None]
                        if row_vals:
                            sheet_data.append(" | ".join(row_vals))
                text_content = "\n".join(sheet_data)

        # Image Metadata & Description using Pillow
        elif file_type in ['image', 'png', 'jpg', 'jpeg', 'webp'] or file_path.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            from PIL import Image
            with Image.open(file_path) as img:
                filename = os.path.basename(file_path)
                text_content = f"Image File: {filename}\nFormat: {img.format}\nDimensions: {img.width}x{img.height} px\nColor Mode: {img.mode}"

        # Plain Text / Markdown / JSON Files
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text_content = f.read()

    except Exception as e:
        text_content = f"Error extracting content: {str(e)}"

    return text_content.strip()


def create_knowledge_chunks(document_obj, chunk_size=800, overlap=100):
    """
    Splits document extracted text into chunks and stores KnowledgeChunk DB objects.
    """
    text = document_obj.extracted_text
    if not text:
        return

    document_obj.chunks.all().delete()

    chunks_data = []
    start = 0
    chunk_index = 0

    while start < len(text):
        end = start + chunk_size
        chunk_text = text[start:end]
        
        chunk_obj = KnowledgeChunk(
            document=document_obj,
            content=chunk_text,
            chunk_index=chunk_index,
            keywords=" ".join(set(chunk_text.lower().split()[:20]))
        )
        chunks_data.append(chunk_obj)
        
        start += (chunk_size - overlap)
        chunk_index += 1

    KnowledgeChunk.objects.bulk_create(chunks_data)


def search_knowledge_base(query, top_k=3):
    """
    High-performance database query checking if user question exists in Knowledge Base.
    Returns (context_string, source_doc_titles).
    """
    if not query:
        return "", []

    clean_query = query.strip()
    tokens = [t.lower() for t in clean_query.split() if len(t) > 2]
    
    if not tokens:
        tokens = [clean_query.lower()]

    # Fast OR Query filtering on Database Chunks
    q_objects = Q()
    for token in tokens:
        q_objects |= Q(content__icontains=token) | Q(keywords__icontains=token)

    chunks = KnowledgeChunk.objects.filter(q_objects).select_related('document')[:top_k]

    if not chunks.exists():
        # Fallback check on Document Title
        for token in tokens:
            docs = KnowledgeDocument.objects.filter(Q(title__icontains=token) | Q(extracted_text__icontains=token))[:2]
            if docs.exists():
                context_blocks = [f"[Document: {d.title}]\n{d.extracted_text[:1000]}" for d in docs]
                titles = [d.title for d in docs]
                return "\n\n".join(context_blocks), titles
        return "", []

    context_blocks = []
    titles = set()
    for chunk in chunks:
        context_blocks.append(f"[Document: {chunk.document.title}]\n{chunk.content}")
        titles.add(chunk.document.title)

    return "\n\n".join(context_blocks), list(titles)
