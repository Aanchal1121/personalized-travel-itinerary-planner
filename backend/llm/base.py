from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Common interface for AI model providers."""

    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        """Generate text from a prompt."""
        raise NotImplementedError
