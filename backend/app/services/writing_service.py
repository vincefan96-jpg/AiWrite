from app.services.ai_service import (
    call_deepseek,
    POLISH_SYSTEM_PROMPT,
    STYLE_CONVERT_SYSTEM_PROMPT,
    TRANSLATE_SYSTEM_PROMPT,
    SUMMARIZE_SYSTEM_PROMPT,
)


async def polish_text(content: str) -> str:
    prompt = f"Please polish and improve the following text:\n\n{content}"
    return await call_deepseek(prompt, POLISH_SYSTEM_PROMPT)


async def convert_style(content: str, style: str) -> str:
    prompt = f"Rewrite the following text in a {style} style:\n\n{content}"
    return await call_deepseek(prompt, STYLE_CONVERT_SYSTEM_PROMPT)


async def translate_text(content: str, target_language: str) -> str:
    prompt = f"Translate the following text to {target_language}:\n\n{content}"
    return await call_deepseek(prompt, TRANSLATE_SYSTEM_PROMPT)


async def summarize_text(content: str, length: str) -> str:
    length_guide = {"short": "Keep the summary within 2-3 sentences.", "medium": "Keep the summary within 1-2 paragraphs.", "long": "Provide a detailed summary covering all key points."}
    prompt = f"Summarize the following text. {length_guide.get(length, length_guide['medium'])}\n\n{content}"
    return await call_deepseek(prompt, SUMMARIZE_SYSTEM_PROMPT)
