import json
import logging
import os
import re
import threading
import urllib.request
import urllib.error
import traceback
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

VERIFY_TOKEN = os.getenv('WHATSAPP_VERIFY_TOKEN', 'axom_whatsapp_secret_2026')
WHATSAPP_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN', 'EAAQ0Jmnx1IYBS7ZBinXfjW9LZBMO8s7ZBihaApPZBnIU6xtI9V4wLszyfIOx4dD6y3W2vpXHwkt2NusD0MZBSpZCeZAYulOrr2ZBEdUmIZA00YdP1JOiNhygrWzp2jfFLMoTuLiLN2rW0ZBQRAoncQJYBVUxHAB2xxAi983S8dgUaf80PMpD7ZAyqgaxenJ4hUYJ28YpjhzODFIaWSKsdbsrpqa6D3S6FU5UpWUzz3e2ZBtYtqIoVzwGj93cZCHw4owJ31QE1Rzbsyh7367roszxOy4NXrY8TUTrRJpdyiAZDZD')
PHONE_NUMBER_ID = os.getenv('WHATSAPP_PHONE_NUMBER_ID', '1331384956732623')
DEBUG_LOG = '/home/admin/whatsapp_debug.log'

def write_debug(msg):
    try:
        with open(DEBUG_LOG, 'a', encoding='utf-8') as f:
            f.write(str(msg) + '\n')
    except Exception:
        pass

def clean_markdown_for_whatsapp(text):
    """
    Cleans raw markdown (###, **, ---) and converts it to clean WhatsApp formatting.
    """
    if not text:
        return ""
        
    # 1. Remove markdown horizontal dividers (---, ***, ___)
    text = re.sub(r'^[ \t]*[-*_]{3,}[ \t]*$', '', text, flags=re.MULTILINE)
    
    # 2. Convert markdown headers (### Title, ## Title, # Title) to WhatsApp Bold (*Title*)
    text = re.sub(r'^[ \t]*#{1,6}\s*(.+)$', r'*\1*', text, flags=re.MULTILINE)
    
    # 3. Convert markdown double bold (**text**) to WhatsApp bold (*text*)
    text = re.sub(r'\*\*(.*?)\*\*', r'*\1*', text)
    
    # 4. Convert markdown bullets (* item or - item) to clean unicode bullet (• item)
    text = re.sub(r'^[ \t]*[-*]\s+', '• ', text, flags=re.MULTILINE)
    
    # 5. Clean up excessive newlines (max 2 consecutive newlines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def send_whatsapp_text(to_phone, text):
    """Sends a text message back to WhatsApp user."""
    url = f"https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Clean the markdown before sending
    clean_text = clean_markdown_for_whatsapp(text)
    
    # WhatsApp max text length is 4096 chars
    if len(clean_text) > 4000:
        clean_text = clean_text[:4000] + "..."

    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": clean_text}
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=20) as resp:
            res_str = resp.read().decode('utf-8')
            write_debug(f"WhatsApp sent successfully to {to_phone}: {res_str}")
    except urllib.error.HTTPError as e:
        err_str = e.read().decode('utf-8')
        write_debug(f"Failed to send WhatsApp message to {to_phone}: {e.code} - {err_str}")
    except Exception as e:
        write_debug(f"Exception sending WhatsApp: {str(e)}")

def process_and_reply(sender_id, user_text, is_audio=False):
    """Processes user message through Axom AI and sends response."""
    write_debug(f"Processing message from {sender_id}: {user_text}")
    try:
        # Call Axom AI internal chat API
        chat_url = "http://127.0.0.1:8000/api/chat/"
        chat_payload = {
            "prompt": user_text,
            "language": "assamese",
            "client_id": f"wa_{sender_id}"
        }
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(chat_url, data=json.dumps(chat_payload).encode('utf-8'), headers=headers, method='POST')
        
        reply_text = ""
        with urllib.request.urlopen(req, timeout=45) as resp:
            resp_bytes = resp.read()
            resp_str = resp_bytes.decode('utf-8', errors='replace').strip()
            
            # Try to parse as JSON first (used for greetings and structured responses)
            try:
                chat_data = json.loads(resp_str)
                reply_text = chat_data.get('response') or chat_data.get('message') or chat_data.get('text') or ""
            except Exception:
                # If not JSON, it is the raw AI generated text response!
                reply_text = resp_str

        if not reply_text:
            reply_text = "নমস্কাৰ! আপোনাৰ বাৰ্তা পালোঁ। অনুগ্ৰহ কৰি আকৌ কওক।"

        write_debug(f"Final Replying to {sender_id}: {reply_text[:120]}...")
        send_whatsapp_text(sender_id, reply_text)
    except Exception as e:
        err = traceback.format_exc()
        write_debug(f"Error in process_and_reply: {err}")
        send_whatsapp_text(sender_id, "নমস্কাৰ! মই Axom AI। কাৰিকৰী বিজুতিৰ বাবে অনুগ্ৰহ কৰি অলপ পাছত চেষ্টা কৰক।")

@csrf_exempt
def whatsapp_webhook(request):
    if request.method == 'GET':
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            return HttpResponse(challenge, content_type='text/plain', status=200)
        else:
            return HttpResponse('Verification token mismatch', status=403)
            
    elif request.method == 'POST':
        try:
            body_str = request.body.decode('utf-8')
            body = json.loads(body_str)
            
            entries = body.get('entry', [])
            for entry in entries:
                changes = entry.get('changes', [])
                for change in changes:
                    val = change.get('value', {})
                    messages = val.get('messages', [])
                    for msg in messages:
                        sender_id = msg.get('from')
                        msg_type = msg.get('type')
                        
                        if msg_type == 'text':
                            user_text = msg.get('text', {}).get('body', '').strip()
                            if sender_id and user_text:
                                threading.Thread(target=process_and_reply, args=(sender_id, user_text, False)).start()
                                
                        elif msg_type == 'audio':
                            audio_id = msg.get('audio', {}).get('id')
                            if sender_id:
                                send_whatsapp_text(sender_id, "🎙️ আপোনাৰ ভয়েচ বাৰ্তা পালোঁ, Axom AI য়ে প্ৰক্ৰিয়া কৰি আছে...")
                                
            return HttpResponse('EVENT_RECEIVED', status=200)
        except Exception as e:
            err = traceback.format_exc()
            write_debug(f"Error handling webhook: {err}")
            return HttpResponse('EVENT_RECEIVED', status=200)
            
    return HttpResponse('Method not allowed', status=405)
