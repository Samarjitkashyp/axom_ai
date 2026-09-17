from django.db import migrations


def seed_rules(apps, schema_editor):
    LanguageRule = apps.get_model('superadmin', 'LanguageRule')
    if LanguageRule.objects.exists():
        return

    rules = [
        {
            'category': 'keep_english',
            'title': 'Person & Place Names',
            'content': 'Guido van Rossum, Elon Musk, Mark Zuckerberg, Sundar Pichai, Tim Berners-Lee, Linus Torvalds, Silicon Valley, California, Bangalore, New Delhi, San Francisco',
            'priority': 100,
        },
        {
            'category': 'keep_english',
            'title': 'Programming Languages & Frameworks',
            'content': 'Python, JavaScript, TypeScript, Java, C++, C#, Ruby, Go, Rust, Swift, Kotlin, PHP, HTML, CSS, SQL, R, MATLAB, Django, Flask, React, Angular, Vue, Node.js, Express, Spring Boot, Laravel, Rails, Next.js, TensorFlow, PyTorch, NumPy, pandas, matplotlib, SciPy, Keras',
            'priority': 95,
        },
        {
            'category': 'keep_english',
            'title': 'Tech Companies & Products',
            'content': 'Google, Microsoft, Apple, Amazon, Meta, OpenAI, GitHub, GitLab, Stack Overflow, VS Code, Visual Studio, IntelliJ, PyCharm, Docker, Kubernetes, AWS, Azure, Linux, Windows, macOS, Android, iOS, Chrome, Firefox, Safari, ChatGPT, Gemini, Claude, Copilot, Minecraft, Pygame, PyPI, Codecademy, Coursera, Udemy',
            'priority': 90,
        },
        {
            'category': 'keep_english',
            'title': 'Technical Terms (keep in English)',
            'content': 'machine learning, deep learning, artificial intelligence, data science, web development, game development, automation, scripting, object-oriented, open source, dynamic typing, static typing, garbage collection, compiler, interpreter, runtime, syntax, API, IDE, SDK, CLI, GUI, URL, HTTP, HTTPS, REST, GraphQL, JSON, XML, CSV, PDF, database, server, client, frontend, backend, full-stack, DevOps, CI/CD, Git, commit, merge, pull request, deploy, debug, variable, function, class, object, module, package, library, framework, algorithm, data structure',
            'priority': 85,
        },
        {
            'category': 'keep_english',
            'title': 'Common Acronyms',
            'content': 'AI, ML, NLP, LLM, API, HTTP, HTTPS, URL, IDE, SDK, CLI, GUI, OS, PDF, HTML, CSS, SQL, DNS, IP, TCP, UDP, SSH, FTP, OOP, MVC, CRUD, RAM, ROM, CPU, GPU, SSD, HDD, IoT, VR, AR, UI, UX',
            'priority': 80,
        },
        {
            'category': 'grammar',
            'title': 'Assamese ৰ vs Bengali র',
            'content': 'ALWAYS use Assamese ৰ (U+09F0), NEVER use Bengali র (U+09B0). Examples: কৰ (not কর), ধৰ্ম (not ধর্ম), পূৰ্ণ (not পূর্ণ), সংৰক্ষণ (not সংরক্ষণ), পৰিচালনা (not পরিচালনা), সৰু (not সরু).',
            'priority': 100,
        },
        {
            'category': 'grammar',
            'title': 'Sentence ending punctuation',
            'content': 'Use Assamese full stop ।  (danda) at end of sentences, NEVER use English period . (dot).',
            'priority': 90,
        },
        {
            'category': 'grammar',
            'title': 'Do not transliterate English terms',
            'content': 'NEVER write English technical terms in Assamese/Bengali script. Write them in original Roman/English script. WRONG: ডাইনামিক টাইপিং, ৱেব ডেভেলপমেণ্ট, মেচিন লাৰ্নিং. RIGHT: Dynamic Typing, Web Development, Machine Learning.',
            'priority': 95,
        },
        {
            'category': 'vocabulary',
            'title': 'Bengali → Assamese corrections',
            'content': 'বন্যা → বানপানী (flood), ক্ৰোৰ → কোটি (crore), তাজা খবৰ → শেহতীয়া বাতৰি (latest news), আজ → আজি (today), লেকিন → কিন্তু (but), ঔৰ → আৰু (and), মহিলা হাতী → মাইকী হাতী (female elephant)',
            'priority': 80,
        },
        {
            'category': 'example',
            'title': 'Technical term formatting',
            'content': 'WRONG: পাইথন এটা ডাইনামিক টাইপিং ভাষা। RIGHT: Python এটা Dynamic Typing ভাষা। WRONG: নামপাই আৰু পাণ্ডাছ লাইব্ৰেৰী। RIGHT: NumPy আৰু pandas লাইব্ৰেৰী।',
            'priority': 75,
        },
        {
            'category': 'example',
            'title': 'Person name formatting',
            'content': 'WRONG: গুইডো ভ্যান ৰসাম। RIGHT: Guido van Rossum। WRONG: ইলন মাস্ক। RIGHT: Elon Musk। Person names must ALWAYS be in English/Roman script, never transliterated into Assamese script.',
            'priority': 75,
        },
    ]

    for r in rules:
        LanguageRule.objects.create(is_active=True, **r)


def reverse_seed(apps, schema_editor):
    LanguageRule = apps.get_model('superadmin', 'LanguageRule')
    LanguageRule.objects.filter(
        title__in=[
            'Person & Place Names',
            'Programming Languages & Frameworks',
            'Tech Companies & Products',
            'Technical Terms (keep in English)',
            'Common Acronyms',
            'Assamese ৰ vs Bengali র',
            'Sentence ending punctuation',
            'Do not transliterate English terms',
            'Bengali → Assamese corrections',
            'Technical term formatting',
            'Person name formatting',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('superadmin', '0004_languagerule'),
    ]
    operations = [
        migrations.RunPython(seed_rules, reverse_seed),
    ]
