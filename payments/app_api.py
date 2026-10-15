"""Plans and payment endpoints for the Axom AI mobile app.

The app signs in with the same session cookie as the website but it has no CSRF token (that is a browser thing), so the
two payment endpoints it needs are the website's own views with CSRF turned off. Nothing is weaker because of that:
creating an order only makes an unpaid Razorpay order for the signed-in user, and verifying one needs Razorpay's signature.
The session cookie is SameSite=Lax, so another website cannot make a browser send it on a forged POST.
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from . import views
from .models import PLAN_CATALOG

# What the app shows for each plan. The prices are not written here: they come from PLAN_CATALOG, the same table the order
# is made from, so the screen can never show one price and charge another.
PLAN_INFO = [
    {
        'id': 'starter', 'name': 'Starter', 'badge': 'Individual',
        'desc': 'For researchers, creators and daily users.', 'words': '50,000 words / month',
        'features': ['50,000 words per month', '2x faster responses', 'GPT-4o Mini and Gemma 2',
                     '50 document conversions a month', 'Full PDF editor and compressor', 'Export chats to PDF and Word',
                     'Priority email support'],
    },
    {
        'id': 'pro', 'name': 'Pro', 'badge': 'Most popular', 'popular': True,
        'desc': 'Advanced models, OCR and 20+ file tools.', 'words': '250,000 words / month',
        'features': ['250,000 words per month', 'Fastest compute, no queue', 'Claude 3.5 Sonnet and Llama 3.3 70B',
                     'Unlimited PDF and Office tools', 'Smart OCR for Assamese and English', 'Ask-PDF assistant',
                     'Voice mode in Assamese', 'Unlimited chat history', '24/7 priority support'],
    },
    {
        'id': 'business', 'name': 'Business', 'badge': 'Team and API',
        'desc': 'For offices and teams that need high volume.', 'words': '1,000,000 words / month',
        'features': ['1,000,000 words per month', 'Up to 5 team seats', 'Your own knowledge base (RAG)',
                     'REST API access', 'Highest priority compute', 'GST invoice', 'Dedicated account manager'],
    },
]


def public_plans():
    out = []
    for info in PLAN_INFO:
        monthly = PLAN_CATALOG.get(info['id'] + '_monthly')
        yearly = PLAN_CATALOG.get(info['id'] + '_yearly')
        if not monthly or not yearly:
            continue
        item = dict(info)
        item['monthly'] = {'key': info['id'] + '_monthly', 'amount': monthly['amount'] // 100, 'days': monthly['days']}
        item['yearly'] = {'key': info['id'] + '_yearly', 'amount': yearly['amount'] // 100, 'days': yearly['days'],
                          'per_month': round(yearly['amount'] / 100 / 12)}
        out.append(item)
    return out


@require_GET
def plans_api(request):
    """GET /api/plans/ -> the plans the app can sell."""
    return JsonResponse({'plans': public_plans()})


create_order_app = csrf_exempt(views.create_order)
verify_payment_app = csrf_exempt(views.verify_payment)
