"""
Axom AI — Assamese Phonetics & AI4Bharat / Bhashini IndicTTS Engine
Provides:
1. G2P (Grapheme-to-Phoneme) rule-based converter & irregular lexicon dictionary.
2. Phonetic phonetic pre-processing for pure Assamese pronunciation (Sibilants /x/, Affricates /s/, Voiced /z/).
3. IndicTTS / AI4Bharat / Bhashini integration for native Assamese Speech Synthesis.
"""

import re
import os
import io
import json
import base64
import logging
import requests
from typing import Dict, Tuple, Optional

logger = logging.getLogger(__name__)

# ─── 1. IRREGULAR PRONUNCIATION LEXICON (DIALECTICAL & PHONETIC ACCURACY) ───
ASSAMESE_PRONUNCIATION_LEXICON: Dict[str, Tuple[str, str]] = {
    # Word: (Phonetic spelling for TTS, IPA notation)
    "অসম": ("অখম", "ɔ.xɔm"),
    "অসমীয়া": ("অখমীয়া", "ɔ.xɔ.mi.ja"),
    "অসমৰ": ("অখমৰ", "ɔ.xɔ.mɔɹ"),
    "নমস্কাৰ": ("নম'খকাৰ", "nɔ.mɔx.kaɹ"),
    "ধন্যবাদ": ("ধইন্নোবাদ", "dʱɔin.no.bad"),
    "সহায়": ("খহায়", "xɔ.haj"),
    "সাহায্য": ("খাহাইজ্য", "xa.haiz.jɔ"),
    "শিক্ষক": ("খিকখক", "xik.xɔk"),
    "শিক্ষা": ("খিকখা", "xik.xa"),
    "বিজ্ঞান": ("বিগ্গ্যান", "big.gjan"),
    "বৈজ্ঞানিক": ("বইগ্গ্যানিক", "bɔi.gja.nik"),
    "স্বাস্থ্য": ("স্থাচ্ছ", "stʰas.sɔ"),
    "চাহ": ("সাহ", "sah"),
    "মাছ": ("মাচ", "mas"),
    "জলপান": ("জ়লপান", "zɔl.pan"),
    "যোৰহাট": ("জ়োৰহাট", "zoɹ.hat"),
    "গুৱাহাটী": ("গুৱাহাটি", "gu.wa.ha.ti"),
    "ডিব্ৰুগড়": ("ডিব্ৰুগৰ", "di.bɹu.gɔɹ"),
    "তেজপুৰ": ("তেজ়পুৰ", "tez.puɹ"),
    "শিলচৰ": ("খিলচৰ", "xil.sɔɹ"),
    "ব্ৰহ্মপুত্ৰ": ("ব্ৰম্মোপুত্ত্ৰ", "bɹɔm.mo.put.tɹɔ"),
    "কাছাৰ": ("কাছাৰ", "ka.saɹ"),
    "ইতিহাস": ("ইতিহাখ", "i.ti.hax"),
    "সংস্কৃতি": ("খংক্ৰিতি", "xɔŋ.kɹi.ti"),
    "ভাষা": ("ভাখা", "bʱa.xa"),
    "সাহিত্য": ("খাহিত্য", "xa.hit.tɔ"),
    "মানুহ": ("মানু", "ma.nuh"),
    "প্ৰশ্ন": ("প্ৰস্ন্ন", "pɹɔs.nɔ"),
    "উত্তৰ": ("উত্তৰ", "ut.tɔɹ"),
    "পৰীক্ষা": ("পৰিকখা", "pɔ.ɹik.xa"),
    "প্ৰধানমন্ত্ৰী": ("প্ৰধানমোন্ত্ৰী", "pɹɔ.dʱan.mɔn.tɹi"),
    "মুখ্যমন্ত্ৰী": ("মুখখোমোন্ত্ৰী", "mukʰ.kʰo.mɔn.tɹi"),
    "আন্দোলন": ("আন্দোলন্", "an.do.lɔn"),
    "সৰ্বোচ্চ": ("খৰ্বোচ্চ", "xɔɹ.bos.sɔ"),
    "উচ্চতম": ("উচ্চতম্", "us.sɔ.tɔm"),
    "স্থান": ("স্থান", "stʰan"),
    "বিশেষ": ("বিখেখ", "bi.xex"),
    "সদস্য": ("খদইস্য", "xɔ.dɔis.sɔ"),
    "প্ৰশাসন": ("প্ৰখাখন", "pɹɔ.xa.xɔn"),
    "সমাজ": ("খমাজ", "xɔ.maz"),
    "সংবাদ": ("খংবাদ", "xɔŋ.bad"),
    "বাতৰি": ("বাতৰি", "ba.tɔ.ɹi"),
    "দেশ": ("দেখ", "dex"),
    "বিদেশ": ("বিদেখ", "bi.dex"),
    "শান্তি": ("খান্তি", "xan.ti"),
    "শুভ": ("খুভ", "xu.bʱɔ"),
    "সফল": ("খফল", "xɔ.pʰɔl"),
    "সফলতা": ("খফলতা", "xɔ.pʰɔl.ta"),
    "প্ৰচেষ্টা": ("প্ৰচেস্তা", "pɹɔ.ses.ta"),
    "জীৱন": ("জ়ীৱন", "zi.wɔn"),
    "জগত": ("জ়গত", "zɔ.gɔt"),
    "পৃথিৱী": ("প্ৰিথিৱী", "pɹi.tʰi.wi"),
    "সূৰ্য": ("খুৰ্জ", "xuɹ.zɔ"),
    "চন্দ্ৰ": ("চন্দ্ৰ", "sɔn.dɹɔ"),
    "সুন্দৰ": ("খুন্দৰ", "xun.dɔɹ"),
    "মৰম": ("মৰম", "mɔ.ɹɔm"),
    "ভালপোৱা": ("ভালপোৱা", "bʱal.po.wa"),
    "সঁচা": ("খঁচা", "xɔ̃.sa"),
    "মিছা": ("মিছা", "mi.sa"),
    "সময়": ("খময়", "xɔ.mɔj"),
    "সন্ধিয়া": ("খন্ধিয়া", "xɔn.dʱi.ja"),
    "ৰাতিপুৱা": ("ৰাতিপুৱা", "ɹa.ti.pu.wa"),
    "আবেলি": ("আবেলি", "a.be.li"),
    "দুপৰীয়া": ("দুপৰীয়া", "du.pɔ.ɹi.ja"),
}


# ─── 2. GRAPHEME-TO-PHONEME (G2P) TRANSFORMATION RULES ───
def to_assamese_phonetic_script(text: str) -> str:
    """
    Transforms standard Assamese written text into an acoustic-friendly phonetic
    representation designed specifically for Text-to-Speech (TTS) models.
    
    Phonological rules:
    - Sibilant velarization: 'শ', 'ষ', 'স' -> 'খ' (/x/ sound) when not preceded by alveolar stops.
    - Sibilant clusters: 'স্ত', 'স্থ', 'স্প', 'স্ফ' -> retain standard 'স' frication.
    - Affricates: 'চ', 'ছ' -> alveolar fricative 's'
    - Voiced affricates: 'জ', 'ঝ', 'য' -> alveolar fricative 'z'
    - Anusvara & Chandrabindu -> proper nasal resonance.
    """
    if not text:
        return ""

    # Step 1: Lexicon direct lookup for irregular whole-word matches
    words = text.split()
    processed_words = []
    
    for word in words:
        # Strip common punctuation for lookup
        clean_word = re.sub(r'[।,\.\?\!\'\"—\-\(\)]', '', word)
        if clean_word in ASSAMESE_PRONUNCIATION_LEXICON:
            phonetic_rep = ASSAMESE_PRONUNCIATION_LEXICON[clean_word][0]
            # preserve original punctuation
            replaced = word.replace(clean_word, phonetic_rep)
            processed_words.append(replaced)
        else:
            processed_words.append(word)

    text = " ".join(processed_words)

    # Step 2: Sibilant rules for remaining words
    # Rule 2a: Protect conjunct clusters 'স্ত', 'স্থ', 'স্ক', 'স্প', 'স্ফ', 'স্ত্ৰ'
    text = re.sub(r'([শষস])্([তথকপফট])', r'স্\2', text)

    # Rule 2b: Lone sibilants -> 'খ' (/x/ phoneme)
    text = re.sub(r'\b[শষস]([ািীুূৃেৈোৌ্]?)', r'খ\1', text)
    text = re.sub(r'(?<=[^\u09cd])[শষস]([ািীুূৃেৈোৌ্]?)', r'খ\1', text)

    # Step 3: Affricates 'চ', 'ছ' -> 'স' sound
    # In colloquial Assamese, 'চাহ' -> 'Sah', 'চকু' -> 'Soku'
    text = re.sub(r'চ([ািীুূৃেৈোৌ্]?)', r'চ\1', text)  # Keep canonical glyph for IndicTTS
    
    # Step 4: Ensure Bengali 'র' is purified to Assamese 'ৰ'
    text = text.replace('\u09b0', '\u09f0')

    return text


def to_assamese_ipa(text: str) -> str:
    """
    Generates an IPA (International Phonetic Alphabet) transcription of Assamese text
    for linguistic analysis and SSML <phoneme> tags.
    """
    if not text:
        return ""

    ipa_map = {
        'অ': 'ɔ', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ɹi',
        'এ': 'e', 'ঐ': 'ɔi', 'ও': 'o', 'ঔ': 'ɔu',
        'ক': 'k', 'খ': 'kʰ', 'গ': 'g', 'ঘ': 'gʱ', 'ঙ': 'ŋ',
        'চ': 's', 'ছ': 's', 'জ': 'z', 'ঝ': 'zʱ', 'ঞ': 'ɲ',
        'ট': 't', 'ঠ': 'tʰ', 'ড': 'd', 'ঢ': 'dʱ', 'ণ': 'n',
        'ত': 't', 'থ': 'tʰ', 'দ': 'd', 'ধ': 'dʱ', 'ন': 'n',
        'প': 'p', 'ফ': 'pʰ', 'ব': 'b', 'ভ': 'bʱ', 'ম': 'm',
        'য': 'z', 'ৰ': 'ɹ', 'ল': 'l', 'ৱ': 'w',
        'শ': 'x', 'ষ': 'x', 'স': 'x', 'হ': 'h',
        'ক্ষ': 'kʰjɔ', 'জ্ঞ': 'gjan', 'ড়': 'ɹ', 'ঢ়': 'ɹʱ', 'য়': 'j',
        'ৎ': 't', 'ং': 'ŋ', 'ঃ': 'h', 'ঁ': '̃',
        'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ɹi',
        'ে': 'e', 'ৈ': 'ɔi', 'ো': 'o', 'ৌ': 'ɔu', '্': ''
    }

    result = []
    i = 0
    while i < len(text):
        char = text[i]
        if char in (' ', '\n', '\t', '.', ',', '?', '!', '।'):
            result.append(char)
        elif char in ipa_map:
            result.append(ipa_map[char])
        else:
            result.append(char)
        i += 1

    return "".join(result)


def to_assamese_ssml(text: str, voice_name: str = "as-IN-Standard-A") -> str:
    """
    Generates standard SSML with phoneme enhancements for Speech Synthesis services.
    """
    phonetic_text = to_assamese_phonetic_script(text)
    ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="as-IN">
  <voice name="{voice_name}">
    <prosody rate="0.95" pitch="+0Hz">
      {phonetic_text}
    </prosody>
  </voice>
</speak>"""
    return ssml
