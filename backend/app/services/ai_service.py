import httpx
from app.core.config import settings


async def call_deepseek(prompt: str, system_prompt: str = "You are a professional writing assistant.") -> str:
    """调用 DeepSeek API (兼容 OpenAI 协议)"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.DEEPSEEK_BASE_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


POLISH_SYSTEM_PROMPT = "You are a professional writing assistant. Polish and improve the given text. Fix grammar errors, improve word choice, enhance readability and flow. Preserve the original meaning. Output only the polished text, no explanations."

STYLE_CONVERT_SYSTEM_PROMPT = "You are a professional writing assistant. Rewrite the given text in the requested style. Output only the rewritten text, no explanations."

TRANSLATE_SYSTEM_PROMPT = "You are a professional translator. Translate the given text to the requested language accurately while preserving tone and formatting. Output only the translated text, no explanations."

SUMMARIZE_SYSTEM_PROMPT = "You are a professional writing assistant. Create a concise summary of the given text. Output only the summary, no explanations."
