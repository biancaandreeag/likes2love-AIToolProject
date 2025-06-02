from shared_utils.kafka_producer import send_to_preprocessor,send_to_scraper
from database.schemas import list_serial, individual_serial
from database.database import posts_collection
from fastapi import APIRouter, HTTPException 
from  shared_utils.logger_config import log
from database.posts import Post
from fastapi import Cookie
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter()

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["uuid"]
    except JWTError:
        return None

def get_uuid_from_token(auth_token: str = Cookie(None)):
    if not auth_token:
        raise HTTPException(status_code=401, detail="Missing auth token")
    uuid = verify_token(auth_token)
    if not uuid:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    return uuid

@router.get("/get-history")
async def get_history(auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    try:
        log.info(f"[ SERVER API ][ Fetching post history for uuid: {uuid} ]")

        query = {
            "uuid": uuid,
            "analyses": {"$exists": True, "$not": {"$size": 0}}
        }
        posts = posts_collection.find(query)
        result = list_serial(posts)

        log.info(f"[ SERVER API ][ Found {len(result)} posts with analyses for uuid: {uuid} ]")
        return result

    except Exception as e:
        log.error(f"[ SERVER API ][ Error fetching history for uuid {uuid}: {e} ]")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.delete("/delete-post")
async def delete_post(post_link: str, model: str,auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    try:
        post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})
        
        if not post:
            log.warning(f"[ SERVER API ][ Post not found: {uuid}, {post_link} ]")
            raise HTTPException(status_code=404, detail="Post not found")
        
        analyses = post.get("analyses", [])
        
        if analyses:
            analysis_to_remove = next((a for a in analyses if a["model"] == model), None)
            
            if analysis_to_remove:
                if len(analyses) == 1:
                    posts_collection.delete_one({"_id": post["_id"]})
                    log.info(f"[ SERVER API ][ Post and analysis deleted: {post['_id']} ]")
                    return {"status": "success", "message": "Post and its analysis deleted"}
                else:
                    posts_collection.update_one(
                        {"_id": post["_id"]},
                        {"$pull": {"analyses": {"model": model}}}
                    )
                    log.info(f"[ SERVER API ][ Analysis {model} deleted from post: {post['_id']} ]")
                    return {"status": "success", "message": "Analysis deleted from post"}
            else:
                log.warning(f"[ SERVER API ][ Analysis model not found: {model} ]")
                raise HTTPException(status_code=404, detail="Analysis model not found")
        else:
            log.warning(f"[ SERVER API ][ No analyses found in post: {post['_id']} ]")
            raise HTTPException(status_code=404, detail="No analyses found in post")
    
    except Exception as e:
        log.error(f"[ SERVER API ][ Error deleting post or analysis: {str(e)} ]")
        return {"status": "error", "message": str(e)}

@router.post("/get-analysis")
async def get_analysis(post_link: str, model: str,platform: str,auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    try:
        log.info(f"[ SERVER API ][ Received analysis request: uuid={uuid}, link={post_link}, model={model}, platform={platform} ]")

        post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})
        if not post:
            log.info(f"[ SERVER API ][ Post with uuid={uuid} and link={post_link} not found in database ]")
            payload = {
            "type": "metadata",
            "uuid": uuid,
            "post_link": post_link,
            "platform": platform,
            "model" : model
            }
            send_to_scraper(payload,uuid)
            return {"status": "success", "message": "Payload sent to Scraping Service."}

        for analysis in post.get("analyses", []):
            if analysis["model"] == model:
                log.info(f"[ SERVER API ][ Post {post_link} already analyzed with model: {model} ]")
                return {"status": "exists", "message": "Post already analyzed with this model"}

        log.info(f"[ SERVER API ][ Post found, returning data for model: {model} ]")

        payload = {
            "type": "metadata",
            "uuid": post["uuid"],
            "post_link": post["post_link"],
            "model" : model
        }

        log.info(f"[ SERVER API ][ Returning Payload: {payload} ]")
        send_to_preprocessor(payload, key=post["uuid"])

        comments_list = [c["comment"] for c in post.get("comments", []) if "comment" in c and c["comment"].strip()]
        batch_size = 500

        for i in range(0, len(comments_list), batch_size):
            batch = {
                "type":"comments_batch",
                "comments": comments_list[i:i + batch_size]
            }
            log.info(f"[ SERVER API ][ Sending comment batch {i // batch_size + 1} with {len(batch['comments'])} comments ]")
            send_to_preprocessor(batch, key=post["uuid"])

        send_to_preprocessor({"type": "end", "uuid": uuid}, key=post["uuid"])
        return {"status": "success", "message": "Payload sent to Preprocessing Service."}

    except Exception as e:
        log.error(f"Error in get-analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/analysis-status")
async def analysis_status(post_link: str, model: str, auth_token: str = Cookie(None)):
    uuid = get_uuid_from_token(auth_token)
    post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})
    if not post:
        return {"status": "not_found"}

    for analysis in post.get("analyses", []):
        if analysis["model"] == model:
            return {"status": "done"}

    return {"status": "processing"}

