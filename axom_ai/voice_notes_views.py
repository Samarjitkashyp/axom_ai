"""
Voice Notes Generator Backend Views for Axom AI.
Transforms spoken transcripts into professional, structured notes (Lecture, Meeting, Ideas, Summary)
using the mandatory multi-tier LLM hierarchy and Assamese script purification.
"""

import json
import logging
import re
import io
from datetime import datetime

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from .ai_notes_views import _call_ai_engine, _detect_title_from_markdown, _add_markdown_styled_runs
from .views import _purify_assamese_with_grammar

logger = logging.getLogger(__name__)


@csrf_exempt
def voice_notes_synthesize_api(request):
    """
    POST /api/voice-notes/synthesize/
    Body: {
      "transcript": "...",
      "mode": "study" | "meeting" | "ideas" | "summary",
      "language": "assamese" | "english" | "hinglish"
    }
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST is allowed"}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        transcript = data.get('transcript', '').strip()
        mode = data.get('mode', 'study').lower().strip()
        language = data.get('language', 'assamese').lower().strip()
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON payload: {str(e)}"}, status=400)

    if not transcript:
        return JsonResponse({"error": "Spoken transcript cannot be empty."}, status=400)

    if len(transcript) < 5:
        return JsonResponse({"error": "Transcript is too short to generate structured notes."}, status=400)

    # Detect language if not explicitly specified
    if re.search(r'[\u0980-\u09FF]', transcript):
        detected_lang = 'assamese'
    elif re.search(r'[\u0900-\u097F]', transcript):
        detected_lang = 'hinglish'
    else:
        detected_lang = language or 'english'

    # System prompts tailored by note type
    if mode == 'meeting':
        system_prompt = (
            "You are Axom AI Executive Secretary. Transform raw spoken conversation or meeting transcription "
            "into clear, professional, actionable Meeting Minutes (কাৰ্যবিৱৰণী). "
            "Structure strictly with:\n"
            "# [Meeting Title / উদ্দেশ্য]\n"
            "## 📌 Quick Summary (সাৰাংশ)\n"
            "## 📋 Key Discussion Points (আলোচনাৰ মুখ্য বিষয়সমূহ)\n"
            "## ✅ Decisions Made (সিদ্ধান্তসমূহ)\n"
            "## 🎯 Action Items & Next Steps (কাৰ্যপন্থা & দায়িত্বসমূহ)\n"
            "Eliminate conversational fillers (uh, um, মানে, আচলতে, etc.). "
            "Do NOT hallucinate facts not present in the spoken transcript."
        )
    elif mode == 'ideas':
        system_prompt = (
            "You are Axom AI Creative Strategist. Transform raw voice stream-of-consciousness or brainstorming "
            "into a structured Innovation Brief.\n"
            "Structure strictly with:\n"
            "# [Concept Title / ধাৰণাৰ নাম]\n"
            "## 💡 Core Idea & Vision (মূল ভাবধাৰা)\n"
            "## 🎯 Key Pillars & Themes (মুখ্য দিশসমূহ)\n"
            "## 🔍 Pros, Challenges & Solutions (সম্ভাৱনা আৰু প্ৰত্যাহ্বান)\n"
            "## 🚀 Suggested Next Experiments (পৰৱৰ্তী পদক্ষেপ)\n"
            "Keep it sharp, inspiring, and cleanly formatted."
        )
    elif mode == 'summary':
        system_prompt = (
            "You are Axom AI Sovereign Synthesizer. Distill the spoken transcript into an ultra-crisp, "
            "high-density executive briefing.\n"
            "Structure strictly with:\n"
            "# [Executive Summary / সাৰাংশ]\n"
            "## 📌 3-Sentence TL;DR\n"
            "## 🔑 Top 5 Critical Takeaways (মুখ্য ৫ টা কথা)\n"
            "Be direct, unambiguous, and eliminate all fluff."
        )
    else:  # default 'study'
        system_prompt = (
            "You are Axom AI Pedagogical Note Master. Transform spoken classroom lectures, teacher explanations, "
            "or study dictations into master-level revision notes for students.\n"
            "Structure strictly with:\n"
            "# [Topic Title / পাঠৰ নাম]\n"
            "## 📖 Topic Overview (পাঠৰ পৰিচয় & সাৰাংশ)\n"
            "## 📝 Core Concepts & Detailed Notes (মূল ধাৰণাসমূহ)\n"
            "## 💡 Key Definitions & Technical Terms (সংজ্ঞা & পৰিভাষাসমূহ)\n"
            "## ⭐ High-Yield Exam Points & Formulas (পৰীক্ষাৰ বাবে গুৰুত্বপূৰ্ণ পইণ্ট)\n"
            "## ❓ Practice Questions (অনুশীলনী প্ৰশ্ন)\n"
            "Keep technical scientific terms (e.g. Photosynthesis, Mitochondria, Ohm's Law) in English alongside "
            "Assamese terms. Ensure pristine clarity."
        )

    # Multi-lingual directive
    lang_instruction = (
        "Write in grammatically authentic Assamese (অসমীয়া). Use strictly correct orthography with 'ৰ' and 'ৱ' "
        "(never use Bengali 'র'). Keep technical terms in English."
        if detected_lang == 'assamese'
        else "Write in natural conversational Hinglish."
        if detected_lang == 'hinglish'
        else "Write in polished, professional international English."
    )

    user_prompt = (
        f"Language Directive: {lang_instruction}\n\n"
        f"Spoken Transcript Input:\n\"\"\"\n{transcript}\n\"\"\"\n\n"
        "Generate complete, rich, highly structured Markdown notes now:"
    )

    try:
        raw_markdown = _call_ai_engine(system_prompt, user_prompt, timeout=60)
        
        # Purify script if Assamese
        if detected_lang == 'assamese':
            raw_markdown = _purify_assamese_with_grammar(raw_markdown)

        title = _detect_title_from_markdown(raw_markdown, default="Voice Notes")
        
        # Extract short summary snippet
        summary_snippet = ""
        summary_match = re.search(r'##\s*[^\n]*(?:Summary|সাৰাংশ|Overview)[^\n]*\n+([^\n#]+)', raw_markdown, re.IGNORECASE)
        if summary_match:
            summary_snippet = summary_match.group(1).strip()
        else:
            summary_snippet = raw_markdown[:180].strip() + "..."

        word_count = len(raw_markdown.split())

        return JsonResponse({
            "success": True,
            "title": title,
            "notes": raw_markdown,
            "summary": summary_snippet,
            "word_count": word_count,
            "language": detected_lang,
            "mode": mode
        })

    except Exception as e:
        logger.error(f"voice_notes_synthesize_api error: {e}", exc_info=True)
        return JsonResponse({
            "error": f"Failed to synthesize notes: {str(e)}"
        }, status=500)


@csrf_exempt
def voice_notes_export_docx_api(request):
    """
    POST /api/voice-notes/export-docx/
    Generates a branded Microsoft Word (.docx) document from structured voice notes.
    """
    if request.method != 'POST':
        return HttpResponse("Method not allowed", status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        title = data.get('title', 'Voice Notes - Axom AI').strip()
        notes_md = data.get('notes', '').strip()
        mode = data.get('mode', 'Voice Notes').capitalize()
        export_format = data.get('format', '').lower().strip()
    except Exception:
        return HttpResponse("Invalid JSON", status=400)

    if not notes_md:
        return HttpResponse("No notes content provided", status=400)

    try:
        import docx
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn

        doc = docx.Document()

        # Page margins
        for section in doc.sections:
            section.top_margin = Inches(0.8)
            section.bottom_margin = Inches(0.8)
            section.left_margin = Inches(0.8)
            section.right_margin = Inches(0.8)

        # Axom AI Header
        header_p = doc.add_paragraph()
        header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        header_run = header_p.add_run("AXOM AI • Voice Notes Generator")
        header_run.font.name = "Segoe UI"
        header_run.font.size = Pt(8.5)
        header_run.font.color.rgb = RGBColor(100, 116, 139)

        # Title
        title_p = doc.add_paragraph()
        title_p.paragraph_format.space_before = Pt(8)
        title_p.paragraph_format.space_after = Pt(4)
        title_run = title_p.add_run(title)
        title_run.font.name = "Segoe UI"
        title_run.font.size = Pt(22)
        title_run.font.bold = True
        title_run.font.color.rgb = RGBColor(15, 23, 42)

        # Metadata subtitle
        meta_p = doc.add_paragraph()
        meta_p.paragraph_format.space_after = Pt(16)
        date_str = datetime.now().strftime("%B %d, %Y")
        meta_run = meta_p.add_run(f"Generated via Axom AI Sovereign Voice Studio • {mode} Mode • {date_str}")
        meta_run.font.name = "Segoe UI"
        meta_run.font.size = Pt(9.5)
        meta_run.font.color.rgb = RGBColor(16, 185, 129)
        meta_run.font.bold = True

        # Parse markdown lines
        lines = notes_md.split('\n')
        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue

            if trimmed.startswith('# '):
                # Skip duplicate main title
                if trimmed[2:].strip().lower() == title.lower():
                    continue
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(16)
                p.paragraph_format.space_after = Pt(4)
                r = p.add_run(trimmed[2:].strip())
                r.font.name = "Segoe UI"
                r.font.size = Pt(16)
                r.font.bold = True
                r.font.color.rgb = RGBColor(15, 23, 42)

            elif trimmed.startswith('## '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(4)
                r = p.add_run(trimmed[3:].strip())
                r.font.name = "Segoe UI"
                r.font.size = Pt(13)
                r.font.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129)

            elif trimmed.startswith('### '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(8)
                p.paragraph_format.space_after = Pt(2)
                r = p.add_run(trimmed[4:].strip())
                r.font.name = "Segoe UI"
                r.font.size = Pt(11)
                r.font.bold = True
                r.font.color.rgb = RGBColor(71, 85, 105)

            elif trimmed.startswith(('- ', '* ', '• ')):
                p = doc.add_paragraph(style='List Bullet')
                p.paragraph_format.space_after = Pt(3)
                _add_markdown_styled_runs(p, trimmed[2:].strip())

            elif re.match(r'^\d+\.\s', trimmed):
                p = doc.add_paragraph(style='List Number')
                p.paragraph_format.space_after = Pt(3)
                content = re.sub(r'^\d+\.\s*', '', trimmed)
                _add_markdown_styled_runs(p, content)

            else:
                p = doc.add_paragraph()
                p.paragraph_format.space_after = Pt(5)
                _add_markdown_styled_runs(p, trimmed)

        # Footer branding
        footer_p = doc.add_paragraph()
        footer_p.paragraph_format.space_before = Pt(24)
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer_run = footer_p.add_run("Created with Axom AI • Northeast India's Sovereign AI Ecosystem • https://aiaxom.co.in")
        footer_run.font.name = "Segoe UI"
        footer_run.font.size = Pt(8)
        footer_run.font.color.rgb = RGBColor(148, 163, 184)

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        filename_clean = re.sub(r'[^\w\-_.]', '_', title)[:40] or "Voice_Notes"

        if export_format == 'json' or request.GET.get('format') == 'json':
            import os
            import uuid
            vn_dir = settings.MEDIA_ROOT / 'voice_notes'
            os.makedirs(vn_dir, exist_ok=True)
            unique_filename = f"{filename_clean}_{uuid.uuid4().hex[:8]}.docx"
            file_path = vn_dir / unique_filename
            with open(file_path, 'wb') as f:
                f.write(buffer.getvalue())

            return JsonResponse({
                'success': True,
                'download_url': f'/media/voice_notes/{unique_filename}',
                'filename': f'{filename_clean}_AxomAI.docx'
            })

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename_clean}_AxomAI.docx"'
        return response

    except Exception as e:
        logger.error(f"voice_notes_export_docx_api error: {e}", exc_info=True)
        return HttpResponse(f"Error generating document: {str(e)}", status=500)


def _call_translation_llm(system_prompt, user_prompt, timeout=20):
    """
    Ultra-fast translation LLM adhering strictly to the 3-Tier priority:
    1. OpenAI (gpt-4o, gpt-4o-mini)
    2. Google Gemini (gemini-2.5-flash, gemini-1.5-flash)
    3. Groq (llama-3.3-70b-versatile sub-second safety net)
    """
    import os
    from .views import http_session, _gemini_generate, _groq_generate

    # Tier 1: OpenAI
    key = os.getenv('OPENAI_API_KEY', '').strip()
    if key:
        for model in ['gpt-4o', 'gpt-4o-mini']:
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
                        'temperature': 0.1,
                    },
                    timeout=timeout,
                )
                if res.status_code == 200:
                    txt = res.json().get('choices', [{}])[0].get('message', {}).get('content', '')
                    if txt and txt.strip():
                        return txt.strip()
            except Exception as e:
                logger.warning(f"Translation OpenAI {model} error: {e}")
                continue

    # Tier 2: Google Gemini
    gk = os.getenv('GEMINI_API_KEY', '').strip()
    if gk:
        try:
            gemini_out = _gemini_generate(
                gk,
                system_prompt,
                user_prompt,
                ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'],
            )
            if gemini_out and gemini_out.strip():
                return gemini_out.strip()
        except Exception as e:
            logger.warning(f"Translation Gemini error: {e}")

    # Tier 3: Groq
    try:
        groq_out = _groq_generate(system_prompt, user_prompt, timeout=timeout)
        if groq_out and groq_out.strip():
            return groq_out.strip()
    except Exception as e:
        logger.warning(f"Translation Groq error: {e}")

    return None


@csrf_exempt
def voice_notes_translate_api(request):
    """
    POST /api/voice-notes/translate/
    Body: {
      "text": "spoken words to translate",
      "source_lang": "english" | "hindi" | "assamese" | "auto",
      "target_lang": "assamese" | "english" | "hindi"
    }
    """
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST is allowed"}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        text = data.get('text', '').strip()
        source_lang = data.get('source_lang', 'auto').lower().strip()
        target_lang = data.get('target_lang', 'assamese').lower().strip()
    except Exception as e:
        return JsonResponse({"error": f"Invalid JSON payload: {str(e)}"}, status=400)

    if not text:
        return JsonResponse({"success": True, "translated_text": ""})

    if source_lang == target_lang or target_lang in ('same', 'none', 'original'):
        return JsonResponse({"success": True, "translated_text": text})

    system_prompt = (
        f"You are Axom AI Sovereign Voice Translator. Translate the following speech text accurately into {target_lang.title()}.\n"
        "Strict Translation Principles:\n"
        "1. Translate accurately and conversationally without adding, assuming, or omitting details.\n"
        "2. ZERO HALLUCINATION: Translate ONLY the provided words. Never output conversational responses, pleasantries, or quotes.\n"
        "3. Assamese Orthography: If the target is Assamese, guarantee pure Assamese script (use 'ৰ' and 'ৱ', never Bengali 'র'). Keep technical terms in English (e.g., Photosynthesis, Python, API, Server, AI).\n"
        "4. Hindi: If the target is Hindi, use natural spoken Devanagari script.\n"
        "5. English: If the target is English, use fluent, natural English.\n"
        "6. Return ONLY the translated string."
    )

    user_prompt = f"Text to translate:\n{text}"

    try:
        translated = _call_translation_llm(system_prompt, user_prompt, timeout=20)
        translated = (translated or text).strip(' "\'`')
        if target_lang == 'assamese':
            try:
                translated = _purify_assamese_with_grammar(translated)
            except Exception:
                pass
        return JsonResponse({
            "success": True,
            "translated_text": translated,
            "source_lang": source_lang,
            "target_lang": target_lang
        })
    except Exception as e:
        logger.error(f"voice_notes_translate_api error: {e}", exc_info=True)
        return JsonResponse({
            "success": True,
            "translated_text": text,
            "warning": "Translation engine fallback to original text."
        })


