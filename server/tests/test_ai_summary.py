import pytest
from unittest.mock import AsyncMock, patch
from src.services.gemini_service import generate_ai_summary

@pytest.mark.asyncio
async def test_ai_summary_success():
    """
    Test Case 9: AI Summary returns valid JSON when Gemini responds.
    """
    mock_response = {
        "summary": "Great work today!",
        "metrics": {"commits": 5}
    }
    
    with patch("httpx.AsyncClient.post") as mock_post:
        # Mock Gemini API response
        mock_post.return_value = AsyncMock(
            status_code=200,
            json=lambda: {
                "candidates": [{
                    "content": {
                        "parts": [{"text": '{"summary": "Great work today!", "metrics": {"commits": 5}}'}]
                    }
                }]
            }
        )
        
        result = await generate_ai_summary({"commits": []})
        assert result["summary"] == "Great work today!"

@pytest.mark.asyncio
async def test_ai_summary_api_failure():
    """
    Test Case 10: Returns None if all Gemini models fail.
    """
    with patch("httpx.AsyncClient.post") as mock_post:
        # Mock API Error
        mock_post.return_value = AsyncMock(status_code=500)
        
        result = await generate_ai_summary({"commits": []})
        assert result is None