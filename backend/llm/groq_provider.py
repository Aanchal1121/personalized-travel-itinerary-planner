import os
from groq import AsyncGroq

try:
    from .base import LLMProvider
except (ImportError, ValueError):
    from base import LLMProvider


class GroqProvider(LLMProvider):
    """Generate text using Groq's asynchronous API."""

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is missing from the backend environment."
            )

        self.client = AsyncGroq(api_key=api_key)
        # Default to gpt-oss-20b or llama-3.3-70b-versatile
        self.model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

    async def generate_text(self, prompt: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional travel planner. You only return valid, parseable JSON conforming strictly to the requested schema, without markdown formatting or introductory text.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.4,
            max_completion_tokens=6000,
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("Groq returned an empty response.")

        # Clean potential markdown fences
        cleaned = content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        return cleaned.strip()
