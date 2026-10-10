"""
Axom AI — Chat Enhancements & Regional Superpowers Engine
Contains:
1. Native Assamese Transliteration Assistant (Phonetic Latin -> অসমীয়া Script)
2. Document OCR & Vision Translation inside Chat
3. Assam Exam & GK Expert Persona Grounding (APSC, ADRE, Assam Police, AHSEC)
4. Chat History Export to Microsoft Word (.docx) & Structured Formats
"""

import os
import json
import base64
import io
import time
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# ---------------------------------------------------------------------------
# 1. Fast Assamese Phonetic Transliteration Dictionary & Engine
# ---------------------------------------------------------------------------
PHONETIC_PHRASES = {
    "aji bohut bhal lagil": "আজি বহুত ভাল লাগিল",
    "bhal lagil": "ভাল লাগিল",
    "moi axomiya": "মই অসমীয়া",
    "moi asomiya": "মই অসমীয়া",
    "kene asa": "কেনেকৈ আছা?",
    "kene aso": "কেনেকৈ আছো",
    "aponar bhal ne": "আপোনাৰ ভালনে?",
    "ki khobor": "কি খবৰ?",
    "ki kotha": "কি কথা?",
    "dhonyobad": "ধন্যবাদ",
    "dhanyabad": "ধন্যবাদ",
    "nomoskar": "নমস্কাৰ",
    "namaskar": "নমস্কাৰ",
    "moi bhal": "মই ভাল",
    "axom amar matrikosh": "অসম আমাৰ মাতৃভূমি",
    "axom bhal pao": "অসমক ভাল পাওঁ",
    "kiba kobo": "কিবা ক'ব?",
    "apuni kobo": "আপুনি ক'ব",
    "mor naam": "মোৰ নাম",
    "ghor kot": "ঘৰ ক'ত?",
    "kenekoi": "কেনেকৈ",
    "kot ase": "ক'ত আছে?",
    "kot jaba": "ক'ত যাবা?",
}

def _purify_assamese(text: str) -> str:
    """Purify Assamese script: replace Bengali ra (র) with Assamese ra (ৰ), etc."""
    if not text:
        return text
    replacements = {
        'র': 'ৰ',
        'ড়': 'ড',
        'ঢ়': 'ঢ',
        'য়': 'য',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text

def transliterate_phonetic_assamese(text: str) -> str:
    """Convert English phonetic Assamese to natural Assamese script."""
    text_clean = text.strip()
    lower = text_clean.lower()
    
    # 1. Check exact dictionary match
    if lower in PHONETIC_PHRASES:
        return PHONETIC_PHRASES[lower]
    
    # 2. Tier 1: OpenAI Flagship (gpt-4o)
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            prompt = (
                "You are an expert Assamese linguist and transliterator. "
                "Convert the following phonetic Assamese text written in English/Latin script into correct, "
                "pure Assamese script (অসমীয়া লিপি). "
                "Rules:\n"
                "- Always use Assamese 'ৰ' (U+09F0) and 'ৱ' (U+09F1), NEVER Bengali 'র'.\n"
                "- Keep any technical/English words in English if appropriate.\n"
                "- Return ONLY the transliterated Assamese text, nothing else.\n\n"
                f"Input: {text_clean}"
            )
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": "You are a precise Assamese transliteration engine. Return only the converted text."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 500
            }
            res = requests.post(url, headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                out = res.json()["choices"][0]["message"]["content"].strip()
                return _purify_assamese(out)
        except Exception:
            pass

    # 3. Tier 2: Google Gemini Flash Fallback
    if GEMINI_API_KEY:
        for model_id in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                prompt = f"Convert phonetic Assamese to native Assamese script. Use Assamese ৰ not Bengali র. Return ONLY converted text: {text_clean}"
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                res = requests.post(url, headers=headers, json=payload, timeout=8)
                if res.status_code == 200:
                    cand = res.json().get("candidates", [])
                    if cand:
                        out = cand[0]["content"]["parts"][0]["text"].strip()
                        return _purify_assamese(out)
            except Exception:
                continue

    return text_clean


# ---------------------------------------------------------------------------
# 2. Document OCR & Vision Engine (Scanned Assamese/English Docs & Images)
# ---------------------------------------------------------------------------
def extract_ocr_from_image_or_doc(file_bytes: bytes, filename: str, mime_type: str = "image/jpeg") -> dict:
    """Extract readable text and provide intelligent overview from image/PDF scan."""
    b64_data = base64.b64encode(file_bytes).decode('utf-8')
    
    # 1. Tier 1: OpenAI GPT-4o Vision
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            prompt = (
                "You are Axom AI's Master Document OCR and Vision Engine.\n"
                "Extract all printed and handwritten text accurately from this document/image.\n"
                "Support both Assamese (অসমীয়া) and English perfectly.\n"
                "Rules:\n"
                "1. If Assamese text is present, extract it cleanly using pure Assamese orthography (use 'ৰ' not 'র').\n"
                "2. Maintain the layout, headings, and bullet points.\n"
                "3. Provide: \n"
                "   - Extracted Full Text\n"
                "   - A 2-sentence Summary of the document\n"
                "   - Primary detected language(s)\n"
                "Output JSON format:\n"
                "{\n"
                '  "text": "extracted text here",\n'
                '  "summary": "quick summary here",\n'
                '  "language": "Assamese / English / Mixed"\n'
                "}"
            )
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{b64_data}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                "response_format": {"type": "json_object"},
                "max_tokens": 3000
            }
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                data = json.loads(res.json()["choices"][0]["message"]["content"])
                data["text"] = _purify_assamese(data.get("text", ""))
                return {"success": True, **data}
        except Exception as e:
            pass

    # 2. Tier 2: Google Gemini Vision Fallback
    if GEMINI_API_KEY:
        for model_id in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                prompt = (
                    "Perform OCR on this image. Extract all text accurately in Assamese and English. "
                    "Return JSON with keys 'text', 'summary', 'language'."
                )
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": b64_data
                                }
                            }
                        ]
                    }]
                }
                res = requests.post(url, headers=headers, json=payload, timeout=25)
                if res.status_code == 200:
                    raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    cleaned = raw_text.strip().replace("```json", "").replace("```", "").strip()
                    try:
                        data = json.loads(cleaned)
                    except Exception:
                        data = {"text": raw_text, "summary": "Extracted text from document.", "language": "Assamese/English"}
                    data["text"] = _purify_assamese(data.get("text", ""))
                    return {"success": True, **data}
            except Exception:
                continue

    return {"success": False, "error": "OCR processing failed. Please ensure the image is clear."}


# ---------------------------------------------------------------------------
# 3. Assam Competitive Exams & GK Persona Grounding
# ---------------------------------------------------------------------------
ASSAM_EXAM_SYSTEM_PROMPT = """
You are Axom AI's dedicated "Assam Competitive Exams & GK Master Expert" (অসম প্ৰতিযোগিতামূলক পৰীক্ষা বিশেষজ্ঞ).
Your role is to guide aspirants preparing for APSC CCE (Prelims & Mains), ADRE (Grade 3 & Grade 4), Assam Police SI/Constable, AHSEC, SEBA, and Assam TET.

CORE KNOWLEDGE GROUNDING:
1. Assam History: Ancient (Pragjyotisha, Kamarupa, Varmans, Salastambha, Pala), Medieval (Ahom Kingdom 1228-1826, Sukaphaa, Lachit Borphukan, Saraighat 1671, Koch Kingdom, Chutia, Kachari, Moamoria Rebellion), Modern (Treaty of Yandabo 1826, British Rule, 1857 in Assam, Maniram Dewan, Patharughat 1894, Phulaguri Dhewa 1861, Assam Association 1903, Assam Accord 1985).
2. Assam Geography: Brahmaputra & Barak River Systems, Majuli River Island, National Parks (Kaziranga, Manas, Dibru-Saikhowa, Nameri, Orang, Raimona, Dihing Patkai), Biosphere Reserves, Ramsar Sites (Deepor Beel), Climate, Forests, Oil Refineries (Digboi, Numaligarh, Guwahati, Bongaigaon), Tea Industry.
3. Art, Culture & Literature: Srimanta Sankardeva, Neo-Vaishnavite Movement, Xatras & Namghars, Bihu festivals (Bohag, Kati, Magh), Sattriya Dance (Classical), Bagurumba, Jhumur, Assamese Silk (Muga, Eri, Pat), Dr. Bhupen Hazarika, Jyoti Prasad Agarwala, Lakshminath Bezbaroa, Orunodoi 1846, Asam Sahitya Sabha.
4. Polity & Economy: Assam Legislative Assembly (126 seats), Lok Sabha (14 seats), Rajya Sabha (7 seats), Sixth Schedule Autonomous Councils (Bodoland, Karbi Anglong, Dima Hasao), Assam Budget & Major Welfare Schemes (Orunodoi, Pragyan Bharati, Mukhya Mantri Nijut Moina).

PEDAGOGICAL ANSWER STRUCTURE:
- Provide accurate, point-wise, high-scoring exam notes.
- Include "⭐ Exam Key Point / PYQ Relevance" highlights.
- If asked for practice, generate standard APSC/ADRE pattern MCQs with detailed explanations for the correct option.
- Support both bilingual Assamese (অসমীয়া) and English seamlessly.
"""

def get_assam_exam_augmented_prompt(user_prompt: str) -> str:
    """Augment prompt with Assam exam instructions."""
    return f"{ASSAM_EXAM_SYSTEM_PROMPT}\n\nUSER ASPIRANT QUERY:\n{user_prompt}"


# ---------------------------------------------------------------------------
# 4. Chat History Export to Microsoft Word (.docx)
# ---------------------------------------------------------------------------
def generate_chat_docx(session_title: str, messages: list) -> io.BytesIO:
    """Generate a beautifully formatted .docx file from chat history."""
    doc = Document()
    
    # Page Margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.8)
        sec.bottom_margin = Inches(0.8)
        sec.left_margin = Inches(0.85)
        sec.right_margin = Inches(0.85)
        sec.different_first_page_header_footer = False

    # Header branding
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("AXOM AI — CONVERSATION TRANSCRIPT")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(15)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(16, 185, 129)  # Emerald
    
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(16)
    sub_run = sub_p.add_run(f"Topic: {session_title or 'Axom AI Chat Session'} | Exported on {time.strftime('%b %d, %Y')}")
    sub_run.font.name = 'Arial'
    sub_run.font.size = Pt(9.5)
    sub_run.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    for idx, msg in enumerate(messages):
        role = msg.get('role', 'user').lower()
        text = msg.get('text', '')
        
        is_user = role in ('user', 'human')
        
        # Message container block
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        
        # Shading & border
        tcPr = cell._element.get_or_add_tcPr()
        if is_user:
            shd_xml = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F1F5F9"/>')
            role_label = "👤 YOU"
            role_color = RGBColor(51, 65, 85)
        else:
            shd_xml = parse_xml(f'<w:shd {nsdecls("w")} w:fill="ECFDF5"/>')
            role_label = "🤖 AXOM AI"
            role_color = RGBColor(5, 150, 105)
            
        tcPr.append(shd_xml)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(2)
        
        # Role Header
        r_head = p.add_run(f"{role_label}\n")
        r_head.font.name = 'Arial'
        r_head.font.size = Pt(9)
        r_head.font.bold = True
        r_head.font.color.rgb = role_color
        
        # Message content
        lines = text.split('\n')
        for l_idx, line in enumerate(lines):
            if l_idx > 0:
                p = cell.add_paragraph()
                p.paragraph_format.space_after = Pt(2)
            
            # Simple markdown strip
            clean_line = line.replace('**', '').replace('###', '').replace('##', '').replace('#', '')
            r_msg = p.add_run(clean_line)
            r_msg.font.name = 'Arial'
            r_msg.font.size = Pt(10)
            r_msg.font.color.rgb = RGBColor(30, 41, 59)
            
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Footer note
    foot_p = doc.add_paragraph()
    foot_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    foot_run = foot_p.add_run("Generated by Axom AI — Assam's Native Sovereign AI Platform (https://aiaxom.co.in)")
    foot_run.font.name = 'Arial'
    foot_run.font.size = Pt(8.5)
    foot_run.font.italic = True
    foot_run.font.color.rgb = RGBColor(148, 163, 184)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Django API View Handlers
# ---------------------------------------------------------------------------
@csrf_exempt
@require_POST
def api_chat_transliterate(request):
    """POST /api/chat/transliterate/ — Transliterate Latin/Phonetic Assamese to Assamese script."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        text = data.get('text', '').strip()
        if not text:
            return JsonResponse({'error': 'text parameter is required'}, status=400)
        
        converted = transliterate_phonetic_assamese(text)
        return JsonResponse({
            'success': True,
            'original': text,
            'transliterated': converted
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_chat_ocr(request):
    """POST /api/chat/ocr/ — Extract text from uploaded document or image file."""
    try:
        if 'file' in request.FILES:
            upload = request.FILES['file']
            file_bytes = upload.read()
            filename = upload.name
            mime_type = upload.content_type or 'image/jpeg'
        else:
            data = json.loads(request.body.decode('utf-8'))
            b64 = data.get('image_base64', '')
            if not b64:
                return JsonResponse({'error': 'No file or image_base64 provided'}, status=400)
            if ',' in b64:
                b64 = b64.split(',', 1)[1]
            file_bytes = base64.b64decode(b64)
            filename = data.get('filename', 'scanned_doc.jpg')
            mime_type = data.get('mime_type', 'image/jpeg')

        res = extract_ocr_from_image_or_doc(file_bytes, filename, mime_type)
        return JsonResponse(res)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_chat_export_docx(request):
    """POST /api/chat/export-docx/ — Download conversation as a Microsoft Word (.docx) file."""
    try:
        data = json.loads(request.body.decode('utf-8'))
        title = data.get('title', 'Axom_AI_Conversation')
        messages = data.get('messages', [])
        
        if not messages:
            return JsonResponse({'error': 'messages array cannot be empty'}, status=400)
            
        buf = generate_chat_docx(title, messages)
        
        import re
        safe_name = re.sub(r'[^\w\-_.]', '_', title)[:40] or 'Axom_AI_Conversation'
        response = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="{safe_name}.docx"'
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_assamese_tts(request):
    """
    POST /api/chat/tts/ & POST /api/tts/synthesize/
    Synthesizes native Assamese Speech using AI4Bharat IndicTTS / Bhashini / Indic Phonetic Engine.
    Payload:
        {
            "text": "অসম আমাৰ মাতৃভূমি। আপোনাক স্বাগতম।",
            "voice": "asm_female" | "asm_male",
            "speed": 1.0
        }
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
        text = data.get('text', '').strip()
        voice = data.get('voice', 'asm_female')
        speed = float(data.get('speed', 1.0))

        if not text:
            return JsonResponse({'success': False, 'error': 'text parameter is required'}, status=400)

        from .assamese_phonetics import AssameseTTSEngine
        res = AssameseTTSEngine.synthesize_speech(text, voice=voice, speed=speed)
        return JsonResponse(res)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@require_POST
def api_assamese_phonetics(request):
    """
    POST /api/chat/phonetics/
    Transforms standard Assamese text to pure phonetic transcript and IPA for linguistic precision.
    """
    try:
        data = json.loads(request.body.decode('utf-8'))
        text = data.get('text', '').strip()

        if not text:
            return JsonResponse({'success': False, 'error': 'text parameter is required'}, status=400)

        from .assamese_phonetics import to_assamese_phonetic_script, to_assamese_ipa, to_assamese_ssml

        phonetic = to_assamese_phonetic_script(text)
        ipa = to_assamese_ipa(text)
        ssml = to_assamese_ssml(text)

        return JsonResponse({
            'success': True,
            'original_text': text,
            'phonetic_text': phonetic,
            'ipa': ipa,
            'ssml': ssml,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

