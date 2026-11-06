export interface ResearchModelFaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const RESEARCH_MODELS_FAQS: ResearchModelFaqItem[] = [
  {
    id: 1,
    question: 'What foundational AI models has Axom AI engineered in Assam?',
    answer:
      'Axom AI has engineered six proprietary foundation AI models documented at aiaxom.co.in/research: (1) Progya 2B, a dense Assamese Large Language Model with a 68,096-token vocabulary; (2) XUWOR Multimodal, a full-duplex conversational audio-visual agent running under 3.8 GB RAM; (3) Xuna Speech, a 600M Conformer ASR delivering a 0.261x real-time factor on consumer quad-core CPUs; (4) Puhor Voice, a 24kHz Flow-Matching Diffusion Transformer speech synthesizer; (5) Xetu Translation Bridge, a 200M neural translation engine scoring 38.6 BLEU; and (6) Axom AI Drishti & Sarkar, edge computer vision and public administration small language models.',
    category: 'models',
  },
  {
    id: 2,
    question: 'Can Axom AI foundation models run locally on consumer CPUs without costly GPU hardware?',
    answer:
      'Yes. All Axom AI models are natively compiled and quantized for edge and CPU inference using GGUF (Q4_K_M, Q5_K_M) and ONNX Runtime. For instance, Progya 2B delivers 28–35 tokens/sec on standard Intel/AMD laptops with 8 GB RAM, and Xuna ASR processes live microphone streams with 0.261x RTF on consumer quad-core processors, eliminating expensive cloud GPU rental dependencies.',
    category: 'deployment',
  },
  {
    id: 3,
    question: 'How does Axom AI solve script contamination and Bengali character leakage in Assamese?',
    answer:
      'Global models (such as ChatGPT, Claude, and Gemini) use generic multilingual tokenizers that fracture Assamese into multi-byte pieces and frequently contaminate outputs by inserting Bengali characters (like Bengali ‘র’ instead of authentic Assamese ‘ৰ’ and omitting ‘ৱ’). Axom AI engineered an authentic 68,096-token vocabulary and a deterministic grammar purification engine that guarantees 99.4% orthographic precision across regional literature and public records.',
    category: 'language',
  },
  {
    id: 4,
    question: 'What datasets are used to train Axom AI models and is data privacy protected?',
    answer:
      'Models are pre-trained and instruction-tuned on 6.19M+ culturally verified regional records, including 3.3M+ Assam administrative and land governance pairs (ALRR 1886, Mission Basundhara 3.0, Jamabandi records), historical chronicles (Buranjis, Lakshminath Bezbaroa works), and bilingual parallel corpora. All data curation complies strictly with India’s Digital Personal Data Protection (DPDP) Act 2023 with zero unauthorized personal data collection.',
    category: 'safety',
  },
  {
    id: 5,
    question: 'How can enterprises, universities, and government bodies deploy or fine-tune Axom AI models?',
    answer:
      'Institutions can deploy Axom AI models in air-gapped on-premise data centers with zero external telemetry, or integrate through hosted high-throughput REST APIs and Python/TypeScript SDKs at user.aiaxom.co.in. We offer custom domain fine-tuning (LoRA / QLoRA) for state departments, banking, healthcare, and educational institutions across Northeast India.',
    category: 'enterprise',
  },
  {
    id: 6,
    question: 'What is the difference between Axom AI research models and the chat assistant at chat.aiaxom.co.in?',
    answer:
      'The research models documented on this page are the raw foundational weights, mathematical architectures, and low-latency inference engines engineered in our Guwahati lab. The consumer chat assistant at chat.aiaxom.co.in is the production user application that integrates these models with live web grounding, PDF document analysis, speech synthesis, and safety guardrails.',
    category: 'general',
  },
];

