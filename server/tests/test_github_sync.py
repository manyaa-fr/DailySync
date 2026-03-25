import pytest
from unittest.mock import AsyncMock, patch
from bson import ObjectId
from src.services.github_sync import sync_github_snapshot

@pytest.mark.asyncio
async def test_sync_github_no_user(mock_mongodb):
    """
    Test Case 6: Sync fails gracefully if user doesn't exist.
    """
    user_id = ObjectId()
    # No user inserted into mock_db
    await sync_github_snapshot(user_id)
    # Should return None without raising error
    assert await mock_mongodb["github_snapshots"].count_documents({}) == 0

@pytest.mark.asyncio
async def test_sync_github_no_token(mock_mongodb):
    """
    Test Case 7: Sync raises error if user has no GitHub token.
    """
    user_id = ObjectId()
    await mock_mongodb["user"].insert_one({
        "_id": user_id,
        "github": {"connected": True} # Missing access_token
    })
    
    with pytest.raises(RuntimeError, match="GitHub access token missing"):
        await sync_github_snapshot(user_id)

@pytest.mark.asyncio
async def test_sync_github_token_revoked(mock_mongodb):
    """
    Test Case 8: If GitHub returns 401, disconnect the user's GitHub account.
    """
    user_id = ObjectId()
    await mock_mongodb["user"].insert_one({
        "_id": user_id,
        "github": {"access_token": "expired_token"}
    })

    with patch("httpx.AsyncClient.get") as mock_get:
        # Mock a 401 Unauthorized from GitHub
        mock_get.return_value = AsyncMock(status_code=401)
        
        await sync_github_snapshot(user_id)
        
        # Verify user's GitHub info was wiped for safety
        updated_user = await mock_mongodb["user"].find_one({"_id": user_id})
        assert "github" not in updated_user