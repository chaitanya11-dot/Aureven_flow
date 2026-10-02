from abc import ABC, abstractmethod
from typing import Dict, Any, List

class MediaSourceAdapter(ABC):
    """
    Common adapter interface for media sources.
    Allows new sources to be added without rewriting the core backend.
    """

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Determines if this adapter can process the given URL."""
        pass

    @abstractmethod
    async def analyze(self, url: str) -> Dict[str, Any]:
        """
        Analyzes the source URL and retrieves legitimate metadata.
        Returns a dict containing:
        - success: bool
        - source: str
        - title: str
        - thumbnail: str
        - duration: int
        - media_type: str ('video' | 'audio')
        - formats: List[dict]
        - error: Optional[dict]
        """
        pass

    @abstractmethod
    def get_formats(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Returns valid, available formats for the analyzed source."""
        pass

    @abstractmethod
    async def download_source(
        self,
        url: str,
        output_path: str,
        max_size_bytes: int,
        progress_callback = None
    ) -> Dict[str, Any]:
        """
        Downloads or stages authorized source media safely into output_path.
        """
        pass
