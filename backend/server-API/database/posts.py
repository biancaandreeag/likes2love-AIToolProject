from typing import List, Dict, Optional
from pydantic import BaseModel

class Analysis(BaseModel):
    model: str
    result: Dict

class Post(BaseModel):
    uuid: str
    post_link: str
    comments: Optional[List[str]] = [] 
    analyses: Optional[List[Analysis]] = []