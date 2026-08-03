import os
import json
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from knowledge.utils import search_knowledge_base

# Global HTTP Session for connection pooling & ultra-fast API calls
http_session = requests.Session()

def home_view(request):
    return render(request, 'index.html')

@csrf_exempt
def chat_api_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body.decode('utf-8'))
        prompt = data.get('prompt', '').strip()
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not prompt:
        return JsonResponse({'error': 'Prompt cannot be empty'}, status=400)

    # 1. First Step: Search Local Database Knowledge Base
    custom_context, source_docs = search_knowledge_base(prompt, top_k=3)

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        if custom_context:
            return JsonResponse({
                'response': f"Information from Database Knowledge Base:\n\n{custom_context}",
                'from_database': True,
                'source_docs': source_docs
            })
        return JsonResponse({'error': 'Gemini API key is not configured on the server.'}, status=500)

    # 2. Formulate Prompt (Augment with Database Context if found)
    if custom_context:
        final_prompt = (
            f"Retrieved Context from Internal Database Knowledge Base:\n"
            f"----------------------------------------\n"
            f"{custom_context}\n"
            f"----------------------------------------\n\n"
            f"User Question: {prompt}\n\n"
            f"Instruction: Answer the user's question clearly and concisely using the provided internal database context. Focus on the facts from the database."
        )
    else:
        final_prompt = prompt

    # Candidate active models for fast response
    candidate_models = [
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemma-4-31b-it',
        'gemma-4-26b-a4b-it'
    ]

    last_error = ""

    for model_id in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": final_prompt}
                        ]
                    }
                ]
            }
            # Short 8s timeout for maximum speed
            res = http_session.post(url, headers=headers, json=payload, timeout=8)
            res_data = res.json()

            if res.status_code == 200 and 'candidates' in res_data and len(res_data['candidates']) > 0:
                candidate = res_data['candidates'][0]
                parts = candidate.get('content', {}).get('parts', [])
                if parts and 'text' in parts[0]:
                    return JsonResponse({
                        'response': parts[0]['text'],
                        'from_database': bool(custom_context),
                        'source_docs': source_docs
                    })

            if 'error' in res_data and 'message' in res_data['error']:
                last_error = res_data['error']['message']
        except Exception as err:
            last_error = str(err)
            continue

    # Fast Fallback: If API fails or is rate-limited, return database context if available!
    if custom_context:
        return JsonResponse({
            'response': f"📄 Found in Database Knowledge Base ({', '.join(source_docs)}):\n\n{custom_context}",
            'from_database': True,
            'source_docs': source_docs
        })

    if 'Quota exceeded' in last_error or '429' in last_error:
        return JsonResponse({
            'error': 'Google Gemini API Rate Limit reached for Free Tier. Please retry in a minute.'
        }, status=429)

    return JsonResponse({'error': f"API Error: {last_error}"}, status=400)
