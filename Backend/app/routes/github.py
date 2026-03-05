from fastapi import APIRouter, Depends, HTTPException
from bson.objectid import ObjectId
from datetime import datetime
from ..models import GithubRepoResponse, UserResponse
from ..services import get_current_user
from ..core.database import get_db
import requests

router = APIRouter(prefix="/github", tags=["github"])


@router.post("/link-repo")
async def link_github_repo(
    repo_owner: str,
    repo_name: str,
    github_token: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Link GitHub repository to account"""
    
    # Verify repo exists
    try:
        response = requests.get(
            f"https://api.github.com/repos/{repo_owner}/{repo_name}",
            headers={"Authorization": f"token {github_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Repository not found or invalid token")
        
        repo_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub API error: {str(e)}")
    
    # Save repo link to database
    repo_dict = {
        "user_id": current_user.id,
        "repo_name": repo_name,
        "repo_owner": repo_owner,
        "repo_url": repo_data.get("html_url"),
        "commits": [],
        "last_sync": None,
        "created_at": datetime.utcnow()
    }
    
    result = db["github_repos"].insert_one(repo_dict)
    repo_dict["_id"] = result.inserted_id
    
    return {"message": "Repository linked successfully", "repo_id": str(result.inserted_id)}


@router.get("/repos", response_model=list)
async def get_user_repos(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user's linked GitHub repositories"""
    repos = list(db["github_repos"].find({"user_id": current_user.id}))
    return [GithubRepoResponse(**repo) for repo in repos]


@router.post("/sync/{repo_id}")
async def sync_repo_commits(
    repo_id: str,
    github_token: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_db)
):
    """Sync commits from GitHub repository"""
    
    try:
        repo_oid = ObjectId(repo_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid repo ID")
    
    repo = db["github_repos"].find_one({
        "_id": repo_oid,
        "user_id": current_user.id
    })
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Fetch commits from GitHub API
    try:
        response = requests.get(
            f"https://api.github.com/repos/{repo['repo_owner']}/{repo['repo_name']}/commits",
            headers={"Authorization": f"token {github_token}"},
            params={"per_page": 10}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch commits")
        
        commits_data = response.json()
        commits = [
            {
                "sha": c["sha"],
                "message": c["commit"]["message"],
                "author": c["commit"]["author"]["name"],
                "date": c["commit"]["author"]["date"],
                "url": c["html_url"]
            }
            for c in commits_data
        ]
        
        # Update database
        db["github_repos"].update_one(
            {"_id": repo_oid},
            {
                "$set": {
                    "commits": commits,
                    "last_sync": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Commits synced successfully", "count": len(commits)}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub API error: {str(e)}")
