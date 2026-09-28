# LLM Model Hierarchy & Fallback Rules

Whenever executing or modifying any AI generation tasks in Axom AI:

1. **Tier 1 (OpenAI — Strongest First):**
   - Always attempt OpenAI models first.
   - Start with the strongest flagship model: `gpt-4o`.
   - If `gpt-4o` is exhausted or rate-limited, step-down to secondary models sequentially (`o3-mini`, `gpt-4o-mini`, etc.).
   - Do NOT immediately switch to Gemini on a single OpenAI error. Only move to Gemini when all active OpenAI models are exhausted.

2. **Tier 2 (Google Gemini — Secondary Fallback):**
   - Only triggered when all OpenAI models are exhausted.
   - Models: `gemini-2.5-flash` -> `gemini-1.5-flash` -> `gemini-flash-latest`.

3. **Tier 3 (Groq — Tertiary Safety Net):**
   - Only triggered if both OpenAI and Gemini fail.
   - Model: `llama-3.3-70b-versatile`.
