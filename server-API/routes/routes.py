from database.schemas import list_serial, individual_serial
from database.database import posts_collection
from fastapi import APIRouter, HTTPException 
from kafka_producer import send_to_preprocessor
from database.posts import Post

from logger_config import log

#salvare rezultate dupa modul AI in db
#trimite comentarii raw dupa scraping in db

router = APIRouter()

@router.get("/test-connection")
def test_connection():
    try:
        return {"status": "connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/add-post")
async def add_post(post: Post):
    try:
        post_dict = post.model_dump() # <- conversie Pydantic-friendly
        result = posts_collection.insert_one(post_dict)
        new_post = posts_collection.find_one({"_id": result.inserted_id})
        log.info(f"[ SERVER API ][ Post added successfully: {new_post['_id']} ]")
        return individual_serial(new_post)
    except Exception as e:
        log.error(f"[ SERVER API ][ Error adding post: {str(e)} ]")
        return {"status": "error", "message": str(e)}
       
@router.get("/get-history/{uuid}")
async def get_history(uuid: str):
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
async def delete_post(uuid: str, post_link: str, model: str):
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
async def get_analysis(uuid: str, post_link: str, model: str):
    try:
        log.info(f"[ SERVER API ][ Received analysis request: uuid={uuid}, link={post_link}, model={model} ]")

        post = posts_collection.find_one({"uuid": uuid, "post_link": post_link})
        if not post:
            log.error(f"[ SERVER API ][ Post with uuid={uuid} and link={post_link} not found in database ]")
            #scraper 
            return { "message": "This needs to go to the scraper-service"}

        for analysis in post.get("analyses", []):
            if analysis["model"] == model:
                log.info(f"[ SERVER API ][ Post {post_link} already analyzed with model: {model} ]")
                return {"status": "exists", "message": "Post already analyzed with this model"}

        log.info(f"[ SERVER API ][ Post found, returning data for model: {model} ]")
        
        payload = {
            "type": "metadata",
            "_id": str(post["_id"]),
            "uuid": post["uuid"],
            "post_link": post["post_link"],
            "model" : model 
        }

        log.info(f"[ SERVER API ][ Returning Payload: {payload} ]")
        send_to_preprocessor(payload, key=post["uuid"])

        comments_list = post.get("comments", [])
        batch_size = 10

        for i in range(0, len(comments_list), batch_size):
            batch = {
                "type":"comments_batch",
                "_id": str(post["_id"]), 
                "comments": comments_list[i:i + batch_size]
            }
            log.info(f"[ SERVER API ][ Sending comment batch {i // batch_size + 1} with {len(batch['comments'])} comments ]")
            send_to_preprocessor(batch, key=post["uuid"])
        
        return {"status": "success", "message": "Payload sent to Preprocessing Service."}
    
    except Exception as e:
        log.error(f"Error in get-analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
