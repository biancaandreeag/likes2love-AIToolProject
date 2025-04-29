def individual_serial(post) -> dict:
    return {
        "id": str(post.get("_id")),
        "uuid": post.get("uuid"),
        "post_link": post.get("post_link"),
        "comments": post.get("comments", []),
        "analyses": post.get("analyses", [])
    }

def list_serial(posts) -> list:
    return [ individual_serial(post) for post in posts ]
