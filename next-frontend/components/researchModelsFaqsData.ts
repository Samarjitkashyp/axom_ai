export interface ResearchModelFaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const RESEARCH_MODELS_FAQS: ResearchModelFaqItem[] = [
  {
    id: 1,
    question: 'Which is the top AI model and Artificial Intelligence research laboratory in Assam?',
    answer:
      'Axom AI is Assam’s premier sovereign artificial intelligence research laboratory headquartered in Guwahati (PIN 781001). Axom AI has developed Northeast India’s foundational AI models — including Progya 2B (Assamese Large Language Model), XUWOR (multimodal AI), Puhor (24kHz studio TTS), Xuna (600M Conformer ASR), Xetu (translation bridge), and Axom AI Sarkar (governance SLM). Unlike cloud-dependent AI systems, Axom AI models run natively on standard CPU edge hardware with zero GPU dependency and complete DPDP Act 2023 data sovereignty.',
    category: 'models',
  },
  {
    id: 2,
    question: 'What is the leading Assamese Large Language Model (LLM) developed in Assam?',
    answer:
      'Progya 2B (প্ৰজ্ঞা) is the sovereign 2.00 Billion parameter dense Assamese Large Language Model (LLM) engineered by Axom AI in Guwahati, Assam. Grounded in 6.19 Million verified regional documents, literature, and administrative archives, Progya features an authentic 68,096-token native vocabulary. It delivers 99.4% Assamese script purity, eliminates Bengali script contamination, and executes locally on consumer laptops under 1.2 GB RAM (Q4_K_M) at 28–35 tokens/sec.',
    category: 'models',
  },
  {
    id: 3,
    question: 'What foundational AI models has Axom AI engineered in Assam?',
    answer:
      'Axom AI has engineered six proprietary foundation AI models documented at aiaxom.co.in/research: (1) Progya 2B, a dense Assamese Large Language Model with a 68,096-token vocabulary; (2) XUWOR Multimodal, a full-duplex conversational audio-visual agent running under 3.8 GB RAM; (3) Xuna Speech, a 600M Conformer ASR delivering a 0.261x real-time factor on consumer quad-core CPUs; (4) Puhor Voice, a 24kHz Flow-Matching Diffusion Transformer speech synthesizer; (5) Xetu Translation Bridge, a 200M neural translation engine scoring 38.6 BLEU; and (6) Axom AI Drishti & Sarkar, edge computer vision and public administration small language models.',
    category: 'models',
  },
  {
    id: 4,
    question: 'Can Axom AI foundation models run locally on consumer CPUs without costly GPU hardware?',
    answer:
      'Yes. All Axom AI models are natively compiled and quantized for edge and CPU inference using GGUF (Q4_K_M, Q5_K_M) and ONNX Runtime. For instance, Progya 2B delivers 28–35 tokens/sec on standard Intel/AMD laptops with 8 GB RAM, and Xuna ASR processes live microphone streams with 0.261x RTF on consumer quad-core processors, eliminating expensive cloud GPU rental dependencies.',
    category: 'deployment',
  },
  {
    id: 5,
    question: 'How does Axom AI solve script contamination and Bengali character leakage in Assamese?',
    answer:
      'Global models (such as ChatGPT, Claude, and Gemini) use generic multilingual tokenizers that fracture Assamese into multi-byte pieces and frequently contaminate outputs by inserting Bengali characters (like Bengali ‘র’ instead of authentic Assamese ‘ৰ’ and omitting ‘ৱ’). Axom AI engineered an authentic 68,096-token vocabulary and a deterministic grammar purification engine that guarantees 99.4% orthographic precision across regional literature and public records.',
    category: 'language',
  },
  {
    id: 6,
    question: 'What datasets are used to train Axom AI models and is data privacy protected?',
    answer:
      'Models are pre-trained and instruction-tuned on 6.19M+ culturally verified regional records, including 3.3M+ Assam administrative and land governance pairs (ALRR 1886, Mission Basundhara 3.0, Jamabandi records), historical chronicles (Buranjis, Lakshminath Bezbaroa works), and bilingual parallel corpora. All data curation complies strictly with India’s Digital Personal Data Protection (DPDP) Act 2023 with zero unauthorized personal data collection.',
    category: 'safety',
  },
  {
    id: 7,
    question: 'How can enterprises, universities, and government bodies deploy or fine-tune Axom AI models?',
    answer:
      'Institutions can deploy Axom AI models in air-gapped on-premise data centers with zero external telemetry, or integrate through hosted high-throughput REST APIs and Python/TypeScript SDKs at user.aiaxom.co.in. We offer custom domain fine-tuning (LoRA / QLoRA) for state departments, banking, healthcare, and educational institutions across Northeast India.',
    category: 'enterprise',
  },
  {
    id: 8,
    question: 'What is the difference between Axom AI research models and the chat assistant at chat.aiaxom.co.in?',
    answer:
      'The research models documented on this page are the raw foundational weights, mathematical architectures, and low-latency inference engines engineered in our Guwahati lab. The consumer chat assistant at chat.aiaxom.co.in is the production user application that integrates these models with live web grounding, PDF document analysis, speech synthesis, and safety guardrails.',
    category: 'general',
  },
];

