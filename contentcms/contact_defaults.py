from .models import ContactPageConfig, ContactChannelItem, ContactFAQItem

DEFAULT_CONTACT_CHANNELS = [
    {
        'channel_id': 'customer-support',
        'title': 'Customer & Account Support',
        'badge': 'Fastest Response',
        'email': 'support@aiaxom.co.in',
        'desc': 'Assistance with account access, word quotas, subscription upgrades, payments via UPI/Cards, and billing inquiries.',
        'turnaround': 'Avg response < 4 business hours',
        'icon_name': 'HelpCircle',
        'order': 1,
    },
    {
        'channel_id': 'business-partnerships',
        'title': 'Business & Enterprise Partnerships',
        'badge': 'Regional Solutions',
        'email': 'support@aiaxom.co.in',
        'desc': 'Custom enterprise contracts, private on-premise RAG deployment, bulk academic licenses, and regional govt/MSME digitization.',
        'turnaround': 'Same-day consultation booking',
        'icon_name': 'Briefcase',
        'order': 2,
    },
    {
        'channel_id': 'developer-api',
        'title': 'Developer & API Integration',
        'badge': 'Northeast AI Infra',
        'email': 'support@aiaxom.co.in',
        'desc': 'Access to high-speed IndicTrans2 translation APIs, Assamese LLM endpoints, document OCR pipelines, and developer tokens.',
        'turnaround': 'Technical response < 8 hours',
        'icon_name': 'Code2',
        'order': 3,
    },
    {
        'channel_id': 'founder-desk',
        'title': 'Executive & Editorial Office',
        'badge': 'Guwahati HQ',
        'email': 'samarjitkashyp@gmail.com',
        'desc': 'Direct communication with founder Samarjit Kashyap for media inquiries, investor discussions, and cultural preservation research.',
        'turnaround': '24-hour executive review',
        'icon_name': 'Mail',
        'order': 4,
    },
]

DEFAULT_CONTACT_FAQS = [
    {
        'question': 'How can I contact Axom AI?',
        'answer': 'You can contact Axom AI by emailing our central support desk at support@aiaxom.co.in or by submitting the contact form on this page. Our core team is based in Guwahati, Assam, and responds to all general queries, technical inquiries, and account assistance within 4 to 12 business hours.',
        'category': 'General & Support',
        'order': 1,
    },
    {
        'question': 'How do I contact Axom AI customer and technical support?',
        'answer': 'For technical issues, payment verifications, or bug reports, email support@aiaxom.co.in with your registered email and a brief description or screenshot. Pro and Business plan subscribers also gain access to expedited ticketing and direct chat assistance inside the Axom AI dashboard.',
        'category': 'General & Support',
        'order': 2,
    },
    {
        'question': 'Where is Axom AI based and located?',
        'answer': 'Axom AI is proudly founded, engineered, and headquartered in Guwahati, Kamrup Metropolitan, Assam, India (PIN 781001). We operate as an indigenous AI technology initiative dedicated to serving users across Assam, Northeast India, and global Assamese speakers.',
        'category': 'Location & Entity',
        'order': 3,
    },
    {
        'question': 'How can I contact Axom AI for business partnerships and enterprise inquiries?',
        'answer': 'For corporate contracts, bulk team licenses, educational institution deployments, or government partnerships, email support@aiaxom.co.in with the subject line "Business Partnership Inquiry". Our team will schedule an interactive demo and custom SLA consultation within 24 business hours.',
        'category': 'Business & Enterprise',
        'order': 4,
    },
    {
        'question': 'How can I report a bug or issue with Assamese generation?',
        'answer': 'If you encounter a hallucination, incorrect Assamese orthography (য-ফলা, ৰ-কাৰ, যুক্তাক্ষৰ), or tool errors (e.g. PDF OCR or image generator), please use the contact form under "Bug Report / Feedback" or email support@aiaxom.co.in with the prompt and output snippet. We continuously update our fine-tuned weights and RAG pipeline using verified user feedback.',
        'category': 'Technical & Models',
        'order': 5,
    },
    {
        'question': 'How can I get technical support for Axom AI API and developer integrations?',
        'answer': 'Developers building applications that require Assamese neural machine translation (IndicTrans2), OCR, or regional LLM reasoning can request API access and documentation by contacting support@aiaxom.co.in with "API Access Request". We provide REST endpoints with API key authentication and high-concurrency rate limits.',
        'category': 'Developer & API',
        'order': 6,
    },
    {
        'question': 'How can I contact Axom AI locally in Assam or Guwahati?',
        'answer': 'Local businesses, educational institutes, and community members in Guwahati and throughout Assam can reach our regional engineering office via support@aiaxom.co.in. For in-person meetings or workshop requests at universities and colleges across Assam, advance scheduling is available via email.',
        'category': 'Location & Entity',
        'order': 7,
    },
    {
        'question': 'What are Axom AI’s customer support working hours and response times?',
        'answer': 'Our customer service and engineering desks operate Monday through Saturday from 9:00 AM to 7:00 PM IST. Average response time for general inquiries is under 4 hours, and technical tickets are resolved within 12 business hours. Critical billing issues for active subscribers receive high-priority same-day handling.',
        'category': 'General & Support',
        'order': 8,
    },
    {
        'question': 'How can students and educators in Assam apply for academic subsidies?',
        'answer': 'Students preparing for APSC, UPSC, board exams, or pursuing degree programs in Assam can email support@aiaxom.co.in from their institutional email or attach a valid college ID card. We provide subsidized educational subscriptions and free AI workshops.',
        'category': 'Business & Enterprise',
        'order': 9,
    },
    {
        'question': 'Can I reach the founder or core engineering team directly?',
        'answer': 'Yes, founder and principal engineer Samarjit Kashyap can be reached directly at samarjitkashyp@gmail.com for research collaborations, investment talks, or press and media interviews regarding generative AI in regional Indian languages.',
        'category': 'General & Support',
        'order': 10,
    },
    {
        'question': 'অসমীয়াত সহায় বিচাৰি কেনেকৈ Axom AI-ৰ সৈতে যোগাযোগ কৰিব পাৰি?',
        'answer': 'আপুনি সম্পূৰ্ণ অসমীয়া ভাষাত support@aiaxom.co.in লৈ ই-মেইল প্ৰেৰণ কৰিব পাৰে বা এই পৃষ্ঠাত থকা যোগাযোগ প্ৰপত্ৰখনত অসমীয়াত লিখিব পাৰে। আমাৰ গুৱাহাটীস্থিত কাৰিকৰী দলে অসমীয়া ভাষাতে সকলো প্ৰশ্নৰ সবিশেষ আৰু খৰতকীয়া উত্তৰ প্ৰদান কৰে।',
        'category': 'অসমীয়া প্ৰশ্নোত্তৰ',
        'order': 11,
    },
    {
        'question': 'How do I resolve billing, UPI payment failure, or subscription upgrade issues?',
        'answer': 'If your UPI or Card transaction was debited without immediate quota activation, email support@aiaxom.co.in with your Razorpay Payment ID or UPI UTR reference number. Our accounts desk confirms and activates your account within 30–60 minutes.',
        'category': 'General & Support',
        'order': 12,
    },
]


def ensure_contact_defaults():
    """Ensure ContactPageConfig, 4 default channels, and 12 default FAQs exist in the database."""
    config = ContactPageConfig.objects.first()
    if not config:
        config = ContactPageConfig.objects.create()

    # Seed channels if none exist
    if ContactChannelItem.objects.count() == 0:
        for ch in DEFAULT_CONTACT_CHANNELS:
            ContactChannelItem.objects.create(
                page_config=config,
                channel_id=ch['channel_id'],
                title=ch['title'],
                badge=ch['badge'],
                email=ch['email'],
                desc=ch['desc'],
                turnaround=ch['turnaround'],
                icon_name=ch['icon_name'],
                order=ch['order'],
                is_active=True,
            )

    # Seed FAQs if none exist
    if ContactFAQItem.objects.count() == 0:
        for f in DEFAULT_CONTACT_FAQS:
            ContactFAQItem.objects.create(
                page_config=config,
                question=f['question'],
                answer=f['answer'],
                category=f.get('category', 'General & Support'),
                order=f['order'],
                is_active=True,
            )

    return config
