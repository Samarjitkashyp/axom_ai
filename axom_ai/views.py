import os
import json
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from knowledge.utils import search_knowledge_base

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

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return JsonResponse({'error': 'Gemini API key is not configured on the server.'}, status=500)

    # 1. Search Custom Database Knowledge Base (RAG Pipeline)
    custom_context = search_knowledge_base(prompt, top_k=3)

    # 2. Formulate Prompt (Augmenting with custom database knowledge if available)
    if custom_context:
        final_prompt = (
            f"You are NovaAI with Custom Knowledge Base Integration.\n"
            f"Here is retrieved knowledge from the internal database:\n"
            f"----------------------------------------\n"
            f"{custom_context}\n"
            f"----------------------------------------\n\n"
            f"User Question: {prompt}\n\n"
            f"Instruction: Answer the user's question clearly using the provided internal database context whenever relevant. If context is provided, rely on it primarily."
        )
    else:
        final_prompt = prompt

    # Sequence of verified working Gemini/Gemma models for this API key
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
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            res_data = res.json()

            if res.status_code == 200 and 'candidates' in res_data and len(res_data['candidates']) > 0:
                candidate = res_data['candidates'][0]
                parts = candidate.get('content', {}).get('parts', [])
                if parts and 'text' in parts[0]:
                    return JsonResponse({
                        'response': parts[0]['text'],
                        'custom_knowledge_used': bool(custom_context)
                    })

            if 'error' in res_data and 'message' in res_data['error']:
                last_error = res_data['error']['message']
        except Exception as err:
            last_error = str(err)
            continue

    if 'Quota exceeded' in last_error or '429' in last_error:
        return JsonResponse({
            'error': 'Google Gemini API Rate Limit reached for Free Tier. Please retry in a minute.'
        }, status=429)

    return JsonResponse({'error': f"Gemini API Error: {last_error}"}, status=400)
