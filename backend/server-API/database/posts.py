from typing import List, Dict, Optional
from pydantic import BaseModel
import datetime

class Analysis(BaseModel):
    type: str
    result: Dict

class Comment(BaseModel):
    comment: str
    preprocessed_comment: Optional[str]
    likes: int
    posted: str
    lang: Optional[str] = None
    no_replies: Optional[int] = None
    label: Optional[str] = None
    offensive_label: Optional[str] = None
    cyberbullying_label: Optional[str] = None


class Post(BaseModel):
    uuid: str
    post_link: str
    platform: Optional[str] = None
    post_name: Optional[str] = None
    post_likes: Optional[str] = None
    post_saved: Optional[str] = None
    post_distribution: Optional[str] = None
    post_comments: Optional[List[Comment]] = None
    post_date: Optional[datetime.datetime] = None
    post_play: Optional[str] = None
    analysis_date: Optional[datetime.datetime] = None
    comments: Optional[List[Comment]] = []
    analyses: Optional[List[Analysis]] = []
