from typing import List, Dict, Optional
from pydantic import BaseModel

class Analysis(BaseModel):
    model: str
    result: Dict

class Comment(BaseModel):
    comment: str
    likes: int
    posted: str

class Post(BaseModel):
    uuid: str
    post_link: str
    platform: Optional[str] = None
    post_name: Optional[str] = None
    comments: Optional[List[Comment]] = []
    analyses: Optional[List[Analysis]] = []
