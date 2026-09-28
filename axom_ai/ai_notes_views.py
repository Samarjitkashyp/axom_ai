"""
AXOM AI — AI Notes Generator Backend
Handles document text extraction (PDF, DOCX, TXT), page mapping,
hierarchical note synthesis, study tools (flashcards, quiz, mind map),
Q&A from notes, refinements, and Word (.docx) export.
"""

import os
import re
import json
import time
import io
import uuid
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# Import LLM helpers & utils from axom_ai.views
from .views import (
    GROQ_API_KEY,
    GROQ_URL,
    GROQ_MODEL,
    _groq_generate,
    _gemini_generate,
    _is_rate_limited,
    _client_ip,
    _purify_assamese_with_grammar,
    http_session,
)

logger = logging.getLogger(__name__)

# Constants
_MAX_FILE_SIZE_MB = 50
_MAX_TEXT_CHARS = 100_000
_CHUNK_SIZE = 14_000

EDUCATION_LEVEL_NAMES = {
    'class_5': 'Class 5 (Primary School, very simple language, relatable analogies)',
    'class_6': 'Class 6 (Middle School, clear explanations, easy vocabulary)',
    'class_7': 'Class 7 (Middle School, structured concepts, clear definitions)',
    'class_8': 'Class 8 (Middle School, foundational academic terms, step-by-step points)',
    'class_9': 'Class 9 (Secondary School, board exam foundation, technical accuracy)',
    'class_10': 'Class 10 (Secondary / Board Exams, high-yield exam points, formulas, definitions)',
    'class_11': 'Class 11 (Higher Secondary, advanced conceptual depth, analytical rigor)',
    'class_12': 'Class 12 (Board / Entrance Exams, comprehensive mastery, competitive edge)',
    'college': 'College / Undergraduate (In-depth academic concepts, theoretical rigor)',
    'university': 'University / Postgraduate (Research-grade analysis, synthesis, critical insights)',
    'professional': 'Professional / Industry (Executive summary, practical applications, bullet points)',
    'general': 'General Audience (Balanced, engaging, crystal-clear explanation)',
}

NOTES_TYPE_INSTRUCTIONS = {
    'quick': (
        "Focus on RAPID REVISION. Make notes concise, bullet-driven, and easy to memorize. "
        "Highlight high-yield facts, core definitions, and formula sheets. Keep paragraphs minimal."
    ),
    'detailed': (
        "Provide COMPREHENSIVE, topic-by-topic in-depth notes. Explain theoretical backgrounds, "
        "step-by-step derivations/mechanisms, contextual nuances, and thorough conceptual breakdowns."
    ),
    'exam': (
        "Focus on EXAM SCORING. Highlight probable board/exam question areas, exact definitions, "
        "crucial formulas, diagrams to draw, common pitfalls/mistakes, and 2-mark & 5-mark answer templates."
    ),
    'simple': (
        "Use SIMPLE, EVERYDAY LANGUAGE with real-world analogies. Break down difficult jargon "
        "into intuitive, friendly concepts that anyone can grasp immediately."
    ),
}

LANGUAGE_CONFIG = {
    'english': {
        'name': 'English',
        'instruction': 'Write the entire study notes in standard, professional, fluent English.',
    },
    'assamese': {
        'name': 'Assamese',
        'instruction': (
            'Write the notes in natural, grammatically correct Assamese (অসমীয়া script). '
            'Use standard Assamese vocabulary and correct orthography (using ৰ and ৱ correctly).'
        ),
    },
    'hinglish': {
        'name': 'Hinglish',
        'instruction': (
            'Write in conversational Hinglish (Hindi written in Latin English alphabet, '
            'as popular in Indian educational tutorials and revision videos). Keep it natural and engaging.'
        ),
    },
    'hindi': {
        'name': 'Hindi',
        'instruction': (
            'Write in clear, formal, and natural Hindi (Devanagari script, मानक हिन्दी). '
            'Ensure proper grammatical gender and formal academic tone.'
        ),
    },
    'bengali': {
        'name': 'Bengali',
        'instruction': (
            'Write in fluent, natural Bengali (বাংলা script). Use formal educational terminology.'
        ),
    },
}


def _extract_pages_from_pdf(path, max_pages=150):
    """
    Extracts pages with page numbers and text using PyMuPDF (pymupdf).
    """
    import pymupdf
    doc = pymupdf.open(path)
    pages = []
    total_words = 0
    full_text_parts = []

    try:
        total_pages = len(doc)
        pages_to_read = min(total_pages, max_pages)
        for i in range(pages_to_read):
            page = doc[i]
            text = page.get_text() or ''
            clean = text.strip()
            word_count = len(clean.split())
            total_words += word_count
            pages.append({
                'page_num': i + 1,
                'char_count': len(clean),
                'word_count': word_count,
                'text': clean,
            })
            if clean:
                full_text_parts.append(f"--- [Page {i + 1}] ---\n{clean}")
    finally:
        doc.close()

    return {
        'page_count': total_pages,
        'pages': pages,
        'word_count': total_words,
        'full_text': "\n\n".join(full_text_parts),
    }


def _extract_from_docx(path):
    """
    Extracts text and structure from a .docx file.
    """
    from docx import Document
    doc = Document(path)
    parts = []
    total_words = 0

    for p in doc.paragraphs:
        t = (p.text or '').strip()
        if t:
            parts.append(t)
            total_words += len(t.split())

    for tbl in doc.tables:
        for row in tbl.rows:
            row_text = ' | '.join(c.text.strip() for c in row.cells if c.text.strip())
            if row_text:
                parts.append(row_text)
                total_words += len(row_text.split())

    full_text = "\n\n".join(parts)
    # Estimate pages (~400 words per standard page)
    est_pages = max(1, (total_words + 399) // 400)

    return {
        'page_count': est_pages,
        'pages': [{'page_num': 1, 'text': full_text, 'word_count': total_words}],
        'word_count': total_words,
        'full_text': full_text,
    }


def _extract_from_txt(path):
    """
    Extracts text from a plain text file.
    """
    content = ''
    for enc in ('utf-8', 'utf-16', 'latin-1', 'cp1252'):
        try:
            with open(path, 'r', encoding=enc) as f:
                content = f.read()
                break
        except (UnicodeDecodeError, OSError):
            continue

    total_words = len(content.split())
    est_pages = max(1, (total_words + 399) // 400)
    return {
        'page_count': est_pages,
        'pages': [{'page_num': 1, 'text': content, 'word_count': total_words}],
        'word_count': total_words,
        'full_text': content,
    }


def _openai_generate_notes(system_prompt, user_prompt, timeout=60):
    """
    Tier 1: OpenAI chat completion (gpt-4o-mini with fallback to gpt-4o).
    """
    key = os.getenv('OPENAI_API_KEY', '').strip()
    if not key:
        return None

    models_to_try = ['gpt-4o-mini', 'gpt-4o']
    for model in models_to_try:
        try:
            res = http_session.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': model,
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_prompt},
                    ],
                    'temperature': 0.3,
                },
                timeout=timeout,
            )
            if res.status_code == 200:
                data = res.json()
                txt = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                if txt and len(txt.strip()) > 50:
                    return txt.strip()
            else:
                logger.warning("OpenAI model %s failed with status %d: %s", model, res.status_code, res.text[:200])
        except Exception as e:
            logger.warning("OpenAI %s exception: %s", model, e)
            continue
    return None


def _call_ai_engine(system_prompt, user_prompt, timeout=75):
    """
    Strict Priority Chain:
      1. OpenAI (Primary: gpt-4o-mini / gpt-4o)
      2. Google Gemini (Secondary: gemini-2.5-flash / gemini-1.5-flash)
      3. Groq (Tertiary: llama-3.3-70b-versatile ultra-fast safety net)
    """
    # 1. Tier 1: OpenAI
    try:
        openai_out = _openai_generate_notes(system_prompt, user_prompt, timeout=timeout)
        if openai_out and len(openai_out.strip()) > 50:
            return openai_out.strip()
    except Exception as e:
        logger.warning("Tier 1 OpenAI error: %s", e)

    # 2. Tier 2: Google Gemini
    gk = os.getenv('GEMINI_API_KEY', '').strip()
    if gk:
        try:
            gemini_out = _gemini_generate(
                gk,
                system_prompt,
                user_prompt,
                ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'],
            )
            if gemini_out and len(gemini_out.strip()) > 50:
                return gemini_out.strip()
        except Exception as e:
            logger.warning("Tier 2 Gemini error: %s", e)

    # 3. Tier 3: Groq
    try:
        groq_out = _groq_generate(system_prompt, user_prompt, timeout=timeout)
        if groq_out and len(groq_out.strip()) > 50:
            return groq_out.strip()
    except Exception as e:
        logger.warning("Tier 3 Groq error: %s", e)

    return None


def _extract_toc_from_markdown(md_text):
    """
    Parses headers from Markdown to build a Table of Contents (TOC).
    """
    toc = []
    lines = md_text.split('\n')
    counter = 1
    for line in lines:
        line_clean = line.strip()
        match = re.match(r'^(#{1,3})\s+(.+)$', line_clean)
        if match:
            hashes, title = match.groups()
            level = len(hashes)
            clean_title = re.sub(r'[*_`#]', '', title).strip()
            slug = f"sec-{counter}-{re.sub(r'[^a-zA-Z0-9]+', '-', clean_title).strip('-').lower()}"
            counter += 1
            toc.append({
                'id': slug,
                'title': clean_title,
                'level': level,
            })
    return toc


def _detect_title_from_markdown(md_text, default="Study Notes"):
    """
    Extracts the main title (first # heading) from the notes markdown.
    """
    for line in md_text.split('\n'):
        line = line.strip()
        if line.startswith('# '):
            clean = line[2:].strip().replace('*', '').replace('_', '')
            if clean:
                return clean
    return default


@csrf_exempt
def ai_notes_analyze_api(request):
    """
    POST /api/ai-notes/analyze/
    Analyzes an uploaded file (PDF/DOCX/TXT) or pasted text before generation.
    Returns: { success, filename, size_mb, page_count, word_count, snippet, message }
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Rate limit exceeded. Please wait a few seconds.'}, status=429)

    f = request.FILES.get('file')
    pasted_text = (request.POST.get('text') or '').strip()

    if not f and not pasted_text:
        return JsonResponse({'error': 'Please upload a PDF/DOCX/TXT file or paste study text.'}, status=400)

    filename = 'Pasted_Text_Material.txt'
    size_mb = 0.0

    if f:
        filename = f.name
        size_bytes = f.size
        size_mb = round(size_bytes / (1024 * 1024), 2)
        if size_bytes > _MAX_FILE_SIZE_MB * 1024 * 1024:
            return JsonResponse({'error': f'File exceeds the {_MAX_FILE_SIZE_MB}MB limit.'}, status=400)

        ext = os.path.splitext(f.name)[1].lower()
        if ext not in ('.pdf', '.docx', '.txt', '.doc', '.rtf', '.md'):
            return JsonResponse({'error': 'Supported file types: .pdf, .docx, .txt'}, status=400)

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'temp_notes_uploads')
        os.makedirs(upload_dir, exist_ok=True)
        temp_path = os.path.join(upload_dir, f"notes_{uuid.uuid4().hex[:8]}{ext}")

        with open(temp_path, 'wb+') as dest:
            for chunk in f.chunks():
                dest.write(chunk)

        try:
            if ext == '.pdf':
                res = _extract_pages_from_pdf(temp_path)
            elif ext in ('.docx', '.doc'):
                res = _extract_from_docx(temp_path)
            else:
                res = _extract_from_txt(temp_path)
        except Exception as e:
            logger.exception("Error extracting document text: %s", e)
            return JsonResponse({'error': f'Failed to process document: {str(e)}'}, status=500)
        finally:
            try:
                os.remove(temp_path)
            except Exception:
                pass
    else:
        # Pasted text
        words = len(pasted_text.split())
        est_pages = max(1, (words + 399) // 400)
        res = {
            'page_count': est_pages,
            'pages': [{'page_num': 1, 'text': pasted_text, 'word_count': words}],
            'word_count': words,
            'full_text': pasted_text,
        }
        size_mb = round(len(pasted_text.encode('utf-8')) / (1024 * 1024), 3)

    if not res.get('full_text', '').strip():
        return JsonResponse({
            'error': 'No readable text could be found. If this is a scanned or image-only PDF, please run OCR first.'
        }, status=400)

    # First 350 chars for preview snippet
    snippet = res['full_text'][:350].strip() + ('...' if len(res['full_text']) > 350 else '')

    return JsonResponse({
        'success': True,
        'filename': filename,
        'size_mb': size_mb,
        'page_count': res['page_count'],
        'word_count': res['word_count'],
        'preview_snippet': snippet,
        'sample_text': res['full_text'][:4000],  # for immediate client caching if desired
    })


@csrf_exempt
def ai_notes_generate_api(request):
    """
    POST /api/ai-notes/generate/
    Generates structured AI study notes from uploaded document or text.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Too many requests. Please wait a moment.'}, status=429)

    t0 = time.time()

    # Parameters
    notes_type = request.POST.get('notes_type', 'detailed').lower()
    education_level = request.POST.get('education_level', 'class_10').lower()
    language = request.POST.get('language', 'english').lower()
    length = request.POST.get('length', 'medium').lower()
    mode = request.POST.get('mode', 'student').lower()
    preserve_terms = request.POST.get('preserve_terms', 'true').lower() in ('true', '1', 'yes')

    # Advanced options
    adv_options_raw = request.POST.get('advanced_options', '[]')
    try:
        adv_options = json.loads(adv_options_raw) if adv_options_raw else []
    except Exception:
        adv_options = []

    # Source text or file
    text = (request.POST.get('text') or '').strip()
    f = request.FILES.get('file')
    filename = request.POST.get('filename', 'Study_Notes')
    page_count = 1

    if not text and f:
        filename = f.name
        ext = os.path.splitext(f.name)[1].lower()
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'temp_notes_uploads')
        os.makedirs(upload_dir, exist_ok=True)
        temp_path = os.path.join(upload_dir, f"gen_{uuid.uuid4().hex[:8]}{ext}")

        with open(temp_path, 'wb+') as dest:
            for chunk in f.chunks():
                dest.write(chunk)

        try:
            if ext == '.pdf':
                doc_res = _extract_pages_from_pdf(temp_path)
            elif ext in ('.docx', '.doc'):
                doc_res = _extract_from_docx(temp_path)
            else:
                doc_res = _extract_from_txt(temp_path)
            text = doc_res['full_text']
            page_count = doc_res['page_count']
        finally:
            try:
                os.remove(temp_path)
            except Exception:
                pass

    if not text:
        return JsonResponse({'error': 'No document text found to generate notes.'}, status=400)

    # Trim to safety cap if massive
    if len(text) > _MAX_TEXT_CHARS:
        text = text[:_MAX_TEXT_CHARS]

    # Resolve configs
    edu_desc = EDUCATION_LEVEL_NAMES.get(education_level, EDUCATION_LEVEL_NAMES['class_10'])
    type_desc = NOTES_TYPE_INSTRUCTIONS.get(notes_type, NOTES_TYPE_INSTRUCTIONS['detailed'])
    lang_info = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG['english'])

    length_guidance = {
        'very_short': 'Keep it very compact and brief, around 300 to 500 words total.',
        'short': 'Keep it concise and punchy, around 600 to 900 words total.',
        'medium': 'Provide well-balanced, standard notes, around 1,200 to 1,800 words total.',
        'detailed': 'Provide detailed and thorough notes, around 2,000 to 3,000 words total.',
        'very_detailed': 'Provide exhaustive, comprehensive chapter-level notes with complete coverage.',
    }.get(length, 'Provide well-balanced notes around 1,500 words.')

    # Advanced options formatting instructions
    adv_directives = []
    if 'definitions' in adv_options:
        adv_directives.append("- Include an explicit '### Key Definitions' section with crisp, accurate definitions.")
    if 'examples' in adv_options:
        adv_directives.append("- Include clear real-world examples and step-by-step illustrations.")
    if 'formulas' in adv_options:
        adv_directives.append("- Highlight all formulas, scientific equations, units, and constants in dedicated code blocks or callouts.")
    if 'dates' in adv_options:
        adv_directives.append("- Include an exact chronological timeline / important dates table.")
    if 'key_terms' in adv_options:
        adv_directives.append("- Include a '### Important Key Terms' glossary.")
    if 'important_questions' in adv_options:
        adv_directives.append("- Add a '### Frequently Asked Exam Questions' section with model answers.")
    if 'exam_tips' in adv_options:
        adv_directives.append("- Include '### Exam Points ⭐' with common mistakes to avoid and scoring tips.")
    if 'page_references' in adv_options:
        adv_directives.append("- When citing topics or definitions, include the source page number from the document, e.g., '(Page 4)'.")
    if 'source_quotes' in adv_options:
        adv_directives.append("- Quote important textbook principles or laws verbatim inside blockquotes (>).")

    adv_instructions_str = "\n".join(adv_directives) if adv_directives else "- Structure with clear topics, key points, and exam takeaways."

    # Preserve technical terminology rule
    terminology_rule = ""
    if preserve_terms and language != 'english':
        terminology_rule = (
            "\nCRITICAL TERMINOLOGY RULE: Keep all core scientific, mathematical, medical, historical, and technical "
            "terms in ENGLISH (e.g., Photosynthesis, Chloroplast, Newton's Laws, Quadratic Equation, Exothermic, Endothermic, "
            "Respiration, Velocity, Mitochondria). Explain the concepts fluently in the requested language, but DO NOT translate "
            "standard technical terms into unnatural local coinages. Example: 'Photosynthesis হৈছে সেই প্ৰক্ৰিয়া যাৰ দ্বাৰা...'\n"
        )

    # Mode prompt differentiation
    if mode == 'teacher':
        mode_directive = (
            "You are creating a TEACHER'S MASTER LESSON PLAN & STUDY NOTES. Organize the notes with:\n"
            "1. Chapter Overview & Pedagogical Learning Objectives (What students should master)\n"
            "2. Key Conceptual Flow (Teaching sequence from basics to advanced)\n"
            "3. Classroom Discussion Prompts & Thought-Provoking Questions\n"
            "4. Blackboard / Presentation Examples & Analogies\n"
            "5. Homework Assignment & Assessment Questions with Model Marking Scheme\n"
        )
    else:
        mode_directive = (
            "You are creating high-impact STUDENT STUDY & REVISION NOTES. Organize the notes with:\n"
            "1. Clear Title and Subject/Chapter Header\n"
            "2. Executive Concept Summary (The Big Picture)\n"
            "3. Topic-by-topic breakdowns with numbered sections, subheadings, and bullet points\n"
            "4. Key Terms, Definitions & Formulas\n"
            "5. Practical Examples & Applications\n"
            "6. Exam Scoring Points & Likely Question Traps ⭐\n"
        )

    system_prompt = (
        f"You are Axom AI's Master Pedagogical AI and Sovereign Education Engine.\n"
        f"Your mission is to generate publication-grade, structured, and crystal-clear study notes from provided study material.\n\n"
        f"TARGET AUDIENCE: {edu_desc}\n"
        f"NOTES STYLE: {type_desc}\n"
        f"LANGUAGE: {lang_info['instruction']}\n"
        f"{terminology_rule}\n"
        f"LENGTH REQUIREMENT: {length_guidance}\n"
        f"MODE: {mode_directive}\n"
        f"ADVANCED DIRECTIVES:\n{adv_instructions_str}\n\n"
        f"FORMATTING RULES:\n"
        f"- Output 100% clean GitHub-flavored Markdown.\n"
        f"- Start with `# [Subject/Topic Title]` on the very first line.\n"
        f"- Use `## 1. [Topic Name]`, `## 2. [Topic Name]`, etc. for major chapters/sections.\n"
        f"- Use bolding `**like this**` for key terms.\n"
        f"- Use bullet points for readability.\n"
        f"- Never make up facts. Strictly ground notes in the provided document content.\n"
        f"- Do NOT wrap output in ```markdown or ``` tags. Output direct raw markdown text."
    )

    user_prompt = f"DOCUMENT TITLE: {filename}\nTOTAL PAGES: {page_count}\n\nDOCUMENT CONTENT:\n{text}"

    generated_notes = _call_ai_engine(system_prompt, user_prompt, timeout=85)

    if not generated_notes:
        return JsonResponse({
            'error': 'AI note synthesis service is temporarily busy. Please try again in a few moments.'
        }, status=503)

    # Clean markdown code block wraps if LLM added them
    generated_notes = re.sub(r'^```(?:markdown)?\s*', '', generated_notes.strip())
    generated_notes = re.sub(r'\s*```$', '', generated_notes.strip())

    # Purify Assamese text if Assamese
    if language == 'assamese':
        generated_notes = _purify_assamese_with_grammar(generated_notes)

    # Extract title and Table of Contents
    title = _detect_title_from_markdown(generated_notes, default=filename.rsplit('.', 1)[0].replace('_', ' '))
    toc = _extract_toc_from_markdown(generated_notes)

    ms_taken = int((time.time() - t0) * 1000)

    return JsonResponse({
        'success': True,
        'title': title,
        'notes_markdown': generated_notes,
        'toc': toc,
        'metadata': {
            'filename': filename,
            'page_count': page_count,
            'notes_type': notes_type,
            'education_level': education_level,
            'language': language,
            'mode': mode,
            'length': length,
            'time_ms': ms_taken,
        },
    })


@csrf_exempt
def ai_notes_refine_api(request):
    """
    POST /api/ai-notes/refine/
    Performs fast in-place modifications on existing notes:
    - shorter: make more concise
    - longer: explain in greater depth
    - simpler: simplify vocabulary and sentence structures
    - add_examples: add intuitive real-world examples
    - add_exam_points: add high-scoring exam points and tips
    - translate: change notes language
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Please wait a moment before refining again.'}, status=429)

    action = request.POST.get('action', '').strip().lower()
    notes_markdown = (request.POST.get('notes_markdown') or '').strip()
    target_lang = (request.POST.get('target_language') or 'english').strip().lower()

    if not notes_markdown:
        return JsonResponse({'error': 'Notes content is required for refinement.'}, status=400)

    action_prompts = {
        'shorter': (
            "Condense the following notes into a shorter, more concise summary. "
            "Keep all essential formulas and core definitions, but eliminate verbosity and redundant explanations."
        ),
        'longer': (
            "Expand and elaborate on the following notes. Add deeper conceptual explanations, "
            "theoretical context, nuances, and step-by-step breakdowns for all key topics."
        ),
        'simpler': (
            "Rewrite the following notes using much simpler, friendly, and easy-to-understand language. "
            "Use relatable everyday analogies to explain any difficult or complex concepts."
        ),
        'add_examples': (
            "Enrich the following notes by adding concrete, intuitive real-world examples, "
            "case studies, or solved numericals to each main topic."
        ),
        'add_exam_points': (
            "Add high-yield 'Exam Points ⭐', common exam traps/mistakes, and model answers "
            "to each major section of the following notes to maximize student scores."
        ),
        'translate': (
            f"Translate and adapt the following study notes into natural, fluent {LANGUAGE_CONFIG.get(target_lang, {}).get('name', target_lang)}. "
            "Keep technical, mathematical, and scientific terms in English while writing explanations in the target language."
        ),
    }

    directive = action_prompts.get(action)
    if not directive:
        return JsonResponse({'error': f'Unknown refinement action: {action}'}, status=400)

    system_prompt = (
        f"You are Axom AI's Study Notes Editor. Your task is to update and refine study notes.\n"
        f"ACTION INSTRUCTION: {directive}\n"
        f"Maintain proper Markdown formatting with headers (# and ##), bullet points, and clean structure.\n"
        f"Do NOT wrap output in ```markdown or ``` tags. Output raw markdown text."
    )

    refined = _call_ai_engine(system_prompt, f"CURRENT NOTES:\n\n{notes_markdown[:50_000]}", timeout=60)
    if not refined:
        return JsonResponse({'error': 'Refinement service is busy. Please try again.'}, status=503)

    refined = re.sub(r'^```(?:markdown)?\s*', '', refined.strip())
    refined = re.sub(r'\s*```$', '', refined.strip())

    if target_lang == 'assamese' or ('assamese' in action):
        refined = _purify_assamese_with_grammar(refined)

    toc = _extract_toc_from_markdown(refined)
    title = _detect_title_from_markdown(refined)

    return JsonResponse({
        'success': True,
        'title': title,
        'notes_markdown': refined,
        'toc': toc,
        'action_applied': action,
    })


@csrf_exempt
def ai_notes_ask_api(request):
    """
    POST /api/ai-notes/ask/
    Answers student questions specifically grounded in the generated notes.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    if _is_rate_limited(_client_ip(request)):
        return JsonResponse({'error': 'Please wait a moment before asking another question.'}, status=429)

    question = (request.POST.get('question') or '').strip()
    notes_context = (request.POST.get('notes_context') or '').strip()

    if not question:
        return JsonResponse({'error': 'Please provide a question.'}, status=400)

    if not notes_context:
        return JsonResponse({'error': 'Notes context is missing.'}, status=400)

    system_prompt = (
        "You are Axom AI's dedicated Study Tutor. The student is asking a doubt regarding "
        "their generated study notes.\n"
        "RULES:\n"
        "1. Answer clearly, accurately, and encouragingly.\n"
        "2. Ground your answer in the provided notes context whenever possible.\n"
        "3. If relevant, mention which section of the notes contains this concept.\n"
        "4. Use bullet points and bold formatting for clarity.\n"
        "5. Keep the response focused and pedagogical."
    )

    user_prompt = f"STUDY NOTES CONTEXT:\n{notes_context[:35_000]}\n\nSTUDENT QUESTION:\n{question}"

    answer = _call_ai_engine(system_prompt, user_prompt, timeout=35)
    if not answer:
        return JsonResponse({'error': 'Unable to generate answer right now. Please try again.'}, status=503)

    return JsonResponse({
        'success': True,
        'question': question,
        'answer': answer.strip(),
    })


@csrf_exempt
def ai_notes_study_tools_api(request):
    """
    POST /api/ai-notes/study-tools/
    Generates interactive study materials from the notes:
    - flashcards: [{front, back, tag}]
    - quiz: [{question, options, answer_index, explanation}]
    - questions: [{type, question, marks, model_answer}]
    - mindmap: valid Mermaid.js diagram
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    tool_type = request.POST.get('tool_type', 'flashcards').lower().strip()
    notes_text = (request.POST.get('notes_text') or '').strip()

    if not notes_text:
        return JsonResponse({'error': 'Notes content is required to generate study tools.'}, status=400)

    if tool_type == 'flashcards':
        system_prompt = (
            "You are an expert educational flashcard creator. Given study notes, generate 8 to 10 high-yield "
            "revision flashcards.\n"
            "Return ONLY a valid JSON array of objects with keys: 'front' (question/term), 'back' (concise answer/definition), and 'tag' (topic tag).\n"
            "Example: [{\"front\": \"What is Photosynthesis?\", \"back\": \"Process by which plants convert light energy into chemical energy.\", \"tag\": \"Biology\"}]\n"
            "Do NOT include any markdown code blocks or commentary. Return ONLY raw JSON array."
        )
    elif tool_type == 'quiz':
        system_prompt = (
            "You are an expert exam quiz creator. Given study notes, generate 5 to 7 multiple choice questions (MCQs).\n"
            "Return ONLY a valid JSON array of objects with keys:\n"
            "- 'question': string\n"
            "- 'options': array of 4 distinct choices [string, string, string, string]\n"
            "- 'answer_index': integer from 0 to 3 representing the correct choice\n"
            "- 'explanation': 1-2 sentence explanation of why this answer is correct.\n"
            "Do NOT include any markdown code blocks or commentary. Return ONLY raw JSON array."
        )
    elif tool_type == 'questions':
        system_prompt = (
            "You are a school/college exam paper setter. Given study notes, create 5 model practice questions:\n"
            "Mix of 2-mark short questions and 5-mark conceptual/analytical questions.\n"
            "Return ONLY a valid JSON array of objects with keys:\n"
            "- 'type': 'Short Answer (2 Marks)' or 'Long Answer (5 Marks)'\n"
            "- 'question': string\n"
            "- 'marks': integer (2 or 5)\n"
            "- 'model_answer': detailed point-wise ideal answer that would score full marks.\n"
            "Do NOT include any markdown code blocks or commentary. Return ONLY raw JSON array."
        )
    elif tool_type == 'mindmap':
        system_prompt = (
            "You are a mind-mapping expert. Given study notes, create a structured Mermaid.js mindmap diagram.\n"
            "Use the `graph TD` format with clean labels.\n"
            "Example:\n"
            "graph TD\n"
            "  Root[\"Topic Title\"]\n"
            "  Root --> S1[\"1. Key Concept\"]\n"
            "  Root --> S2[\"2. Second Concept\"]\n"
            "  S1 --> S1A[\"Sub-point A\"]\n"
            "  S1 --> S1B[\"Sub-point B\"]\n"
            "Return ONLY the raw Mermaid diagram text. Do not wrap in ```mermaid."
        )
    else:
        return JsonResponse({'error': f'Unsupported study tool type: {tool_type}'}, status=400)

    res = _call_ai_engine(system_prompt, f"STUDY NOTES:\n\n{notes_text[:35_000]}", timeout=50)
    if not res:
        return JsonResponse({'error': 'Study tool generation failed. Please try again.'}, status=503)

    clean_res = res.strip()
    # Remove code blocks if present
    clean_res = re.sub(r'^```(?:json|mermaid)?\s*', '', clean_res)
    clean_res = re.sub(r'\s*```$', '', clean_res)

    if tool_type in ('flashcards', 'quiz', 'questions'):
        try:
            parsed_data = json.loads(clean_res)
            return JsonResponse({'success': True, 'tool_type': tool_type, 'data': parsed_data})
        except Exception:
            # Fallback regex parse or return as text
            return JsonResponse({'success': True, 'tool_type': tool_type, 'raw_data': clean_res})
    else:
        # Mind map
        return JsonResponse({'success': True, 'tool_type': 'mindmap', 'mermaid_code': clean_res})


@csrf_exempt
def ai_notes_export_docx_api(request):
    """
    POST /api/ai-notes/export-docx/
    Converts Markdown study notes into a styled, professional Word document (.docx).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    title = (request.POST.get('title') or 'Axom AI Study Notes').strip()
    notes_markdown = (request.POST.get('notes_markdown') or '').strip()

    if not notes_markdown:
        return JsonResponse({'error': 'Notes content is required to export DOCX.'}, status=400)

    try:
        from docx import Document
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.enum.table import WD_TABLE_ALIGNMENT
        from docx.oxml import OxmlElement, parse_xml
        from docx.oxml.ns import nsdecls, qn

        doc = Document()

        # Set standard margins (0.75 in)
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(0.75)
            section.bottom_margin = Inches(0.75)
            section.left_margin = Inches(0.75)
            section.right_margin = Inches(0.75)

        # Header branding
        header = sections[0].header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("AXOM AI • AI GENERATED STUDY NOTES")
        hrun.font.size = Pt(8.5)
        hrun.font.bold = True
        hrun.font.color.rgb = RGBColor(123, 47, 247)

        # Document Title
        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_title.paragraph_format.space_before = Pt(4)
        p_title.paragraph_format.space_after = Pt(2)
        r_title = p_title.add_run(title)
        r_title.font.size = Pt(22)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(26, 26, 46)

        # Subtitle badge / timestamp
        p_sub = doc.add_paragraph()
        p_sub.paragraph_format.space_after = Pt(16)
        r_sub = p_sub.add_run(f"Generated via Axom AI Sovereign Education Engine • {time.strftime('%B %d, %Y')}")
        r_sub.font.size = Pt(9.5)
        r_sub.font.italic = True
        r_sub.font.color.rgb = RGBColor(100, 100, 120)

        # Parse Markdown line by line
        lines = notes_markdown.split('\n')
        in_code_block = False

        for line in lines:
            stripped = line.strip()

            if stripped.startswith('```'):
                in_code_block = not in_code_block
                continue

            if in_code_block:
                p_code = doc.add_paragraph()
                p_code.paragraph_format.left_indent = Inches(0.3)
                p_code.paragraph_format.space_after = Pt(2)
                r_code = p_code.add_run(line)
                r_code.font.name = 'Consolas'
                r_code.font.size = Pt(9)
                r_code.font.color.rgb = RGBColor(40, 40, 50)
                continue

            if not stripped:
                continue

            # Heading 1 (# ...)
            if stripped.startswith('# '):
                # We already put the main title, but if another H1 exists
                h = doc.add_heading(level=1)
                h.paragraph_format.space_before = Pt(14)
                h.paragraph_format.space_after = Pt(4)
                r = h.add_run(stripped[2:].strip().replace('*', ''))
                r.font.size = Pt(16)
                r.font.bold = True
                r.font.color.rgb = RGBColor(123, 47, 247)
                continue

            # Heading 2 (## ...)
            if stripped.startswith('## '):
                h = doc.add_heading(level=2)
                h.paragraph_format.space_before = Pt(12)
                h.paragraph_format.space_after = Pt(3)
                r = h.add_run(stripped[3:].strip().replace('*', ''))
                r.font.size = Pt(13)
                r.font.bold = True
                r.font.color.rgb = RGBColor(40, 40, 90)
                continue

            # Heading 3 (### ...)
            if stripped.startswith('### '):
                h = doc.add_heading(level=3)
                h.paragraph_format.space_before = Pt(8)
                h.paragraph_format.space_after = Pt(2)
                r = h.add_run(stripped[4:].strip().replace('*', ''))
                r.font.size = Pt(11)
                r.font.bold = True
                r.font.color.rgb = RGBColor(80, 50, 140)
                continue

            # Blockquote (> ...)
            if stripped.startswith('>'):
                p_quote = doc.add_paragraph()
                p_quote.paragraph_format.left_indent = Inches(0.4)
                p_quote.paragraph_format.space_before = Pt(4)
                p_quote.paragraph_format.space_after = Pt(4)
                r_quote = p_quote.add_run(stripped.lstrip('> ').strip())
                r_quote.font.italic = True
                r_quote.font.size = Pt(10)
                r_quote.font.color.rgb = RGBColor(70, 70, 90)
                continue

            # Bullet points (- ... or * ...)
            if stripped.startswith('- ') or stripped.startswith('* '):
                p_bullet = doc.add_paragraph(style='List Bullet')
                p_bullet.paragraph_format.space_after = Pt(2)
                _add_markdown_styled_runs(p_bullet, stripped[2:].strip())
                continue

            # Numbered list (1. ... 2. ...)
            num_match = re.match(r'^(\d+)\.\s+(.*)$', stripped)
            if num_match:
                num, item_text = num_match.groups()
                p_num = doc.add_paragraph(style='List Number')
                p_num.paragraph_format.space_after = Pt(2)
                _add_markdown_styled_runs(p_num, item_text)
                continue

            # Standard paragraph
            p_para = doc.add_paragraph()
            p_para.paragraph_format.space_after = Pt(4)
            _add_markdown_styled_runs(p_para, stripped)

        # Footer
        footer = sections[0].footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Created with Axom AI Study Notes Generator • aiaxom.co.in")
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(150, 150, 160)

        # Output to buffer
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        safe_filename = re.sub(r'[^a-zA-Z0-9_\-]+', '_', title).strip('_') or 'study_notes'
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )
        response['Content-Disposition'] = f'attachment; filename="{safe_filename}.docx"'
        return response

    except Exception as e:
        logger.exception("Error exporting DOCX: %s", e)
        return JsonResponse({'error': f'Failed to generate Word document: {str(e)}'}, status=500)


def _add_markdown_styled_runs(paragraph, text):
    """
    Parses bold **text** and regular text into python-docx runs.
    """
    from docx.shared import Pt, RGBColor
    tokens = re.split(r'(\*\*.*?\*\*)', text)
    for token in tokens:
        if token.startswith('**') and token.endswith('**'):
            bold_text = token[2:-2]
            r = paragraph.add_run(bold_text)
            r.bold = True
            r.font.size = Pt(10.5)
            r.font.color.rgb = RGBColor(20, 20, 30)
        else:
            r = paragraph.add_run(token)
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(40, 40, 50)
