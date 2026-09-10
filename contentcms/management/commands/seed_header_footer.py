from django.core.management.base import BaseCommand
from contentcms.models import (
    HeaderSettings, HeaderNavItem, HeaderMegaMenuItem,
    FooterSettings, FooterColumn, FooterColumnLink, FooterSocialLink
)

class Command(BaseCommand):
    help = 'Seeds initial Header & Footer dynamic configuration'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Header & Footer settings...")

        # 1. HeaderSettings
        header, _ = HeaderSettings.objects.get_or_create(id=1, defaults={
            'logo_image_url': '/axom-logo.png',
            'logo_alt_text': 'Axom AI — Smart. Assamese. AI For All.',
            'cta_signin_text': 'Sign in',
            'cta_signin_url': 'https://chat.aiaxom.co.in/',
            'cta_chat_text': 'Open Chat',
            'cta_chat_url': 'https://chat.aiaxom.co.in/',
            'is_active': True,
        })
        header.logo_image_url = '/axom-logo.png'
        header.save()

        # 2. HeaderNavItems
        nav_items_data = [
            ('Use Cases', '/#usecases', 1),
            ('Pricing', '/#pricing', 2),
            ('Blog & Insights', '/blog', 3),
            ('FAQ', '/faq', 4),
        ]
        if not HeaderNavItem.objects.exists():
            for title, url, order in nav_items_data:
                HeaderNavItem.objects.create(title=title, url=url, order=order, is_active=True)
            self.stdout.write(f"Created {len(nav_items_data)} Header Nav Items.")

        # 3. HeaderMegaMenuItems
        mega_items_data = [
            ('AI Chat', 'ChatGPT-style Assamese chat', 'fa-solid fa-brain', 'text-fuchsia-400', 'https://chat.aiaxom.co.in/tools', 1),
            ('AI Writer', 'Emails, posts, essays', 'fa-solid fa-pen-nib', 'text-purple-400', 'https://chat.aiaxom.co.in/tools', 2),
            ('Image Generator', 'FLUX + Pollinations + Gemini', 'fa-solid fa-wand-magic-sparkles', 'text-pink-400', 'https://chat.aiaxom.co.in/tools', 3),
            ('Document Analyzer', 'Summarize PDFs & DOCX', 'fa-solid fa-file-pdf', 'text-blue-400', 'https://chat.aiaxom.co.in/tools', 4),
            ('Code Assistant', 'Write, debug, explain code', 'fa-solid fa-code', 'text-indigo-400', 'https://chat.aiaxom.co.in/tools', 5),
            ('Web Search', 'Real-time answers via Tavily', 'fa-solid fa-globe', 'text-amber-400', 'https://chat.aiaxom.co.in/tools', 6),
            ('PDF Tools', 'Merge / split / OCR / edit', 'fa-solid fa-file-contract', 'text-red-400', 'https://chat.aiaxom.co.in/tools', 7),
            ('Data Analyzer', 'Excel & CSV insights', 'fa-solid fa-chart-pie', 'text-cyan-400', 'https://chat.aiaxom.co.in/tools', 8),
            ('Translator', 'IndicTrans2 Assamese', 'fa-solid fa-language', 'text-emerald-400', 'https://chat.aiaxom.co.in/tools', 9),
        ]
        if not HeaderMegaMenuItem.objects.exists():
            for title, desc, icon, color, url, order in mega_items_data:
                HeaderMegaMenuItem.objects.create(
                    title=title, description=desc, icon_class=icon,
                    color_class=color, url=url, order=order, is_active=True
                )
            self.stdout.write(f"Created {len(mega_items_data)} Mega Menu Items.")

        # 4. FooterSettings
        footer, _ = FooterSettings.objects.get_or_create(id=1, defaults={
            'logo_image_url': '/axom-logo.png',
            'description': 'AI for a more inclusive future.\nBuilt in Assam, for the world.',
            'tagline': 'অসমৰ প্ৰথমটো থলুৱা AI প্লেটফৰ্ম • Smart. Assamese. AI for All.',
            'copyright_text': 'Axom AI. All rights reserved.',
            'is_active': True,
        })
        footer.logo_image_url = '/axom-logo.png'
        footer.save()

        # 5. Footer Columns & Links
        columns_data = [
            ('Product', 1, [
                ('AI Tools', 'https://chat.aiaxom.co.in/tools', True, 1),
                ('Pricing', '/#pricing', False, 2),
                ("What's New", '/blog', False, 3),
                ('Use Cases', '/#usecases', False, 4),
            ]),
            ('Solutions', 2, [
                ('For Students', '/#usecases', False, 1),
                ('For Businesses', '/#usecases', False, 2),
                ('For Educators', '/#usecases', False, 3),
                ('For Developers', '/#usecases', False, 4),
            ]),
            ('Resources', 3, [
                ('Blog & Insights', '/blog', False, 1),
                ('Frequently Asked Questions', '/faq', False, 2),
                ('Help & Support', 'https://user.aiaxom.co.in/support/', True, 3),
                ('AI Tools Directory', 'https://chat.aiaxom.co.in/tools', True, 4),
            ]),
            ('Company', 4, [
                ('About Axom AI', '/#tools', False, 1),
                ('Privacy Policy', '/faq', False, 2),
                ('Terms of Service', '/faq', False, 3),
                ('Contact Support', 'mailto:samarjitkashyp@gmail.com', True, 4),
            ]),
        ]
        if not FooterColumn.objects.exists():
            for col_title, col_order, links in columns_data:
                col = FooterColumn.objects.create(title=col_title, order=col_order, is_active=True)
                for link_title, link_url, is_ext, link_order in links:
                    FooterColumnLink.objects.create(
                        column=col, title=link_title, url=link_url,
                        is_external=is_ext, order=link_order, is_active=True
                    )
            self.stdout.write(f"Created {len(columns_data)} Footer Columns & Links.")

        # 6. Footer Social Links
        socials_data = [
            ('X (Twitter)', 'fa-brands fa-x-twitter', 'https://x.com', 1),
            ('LinkedIn', 'fa-brands fa-linkedin-in', 'https://linkedin.com', 2),
            ('YouTube', 'fa-brands fa-youtube', 'https://youtube.com', 3),
            ('Instagram', 'fa-brands fa-instagram', 'https://instagram.com', 4),
        ]
        if not FooterSocialLink.objects.exists():
            for platform, icon, url, order in socials_data:
                FooterSocialLink.objects.create(
                    platform=platform, icon_class=icon, url=url, order=order, is_active=True
                )
            self.stdout.write(f"Created {len(socials_data)} Footer Social Links.")

        self.stdout.write(self.style.SUCCESS("Header & Footer seeding completed successfully!"))
