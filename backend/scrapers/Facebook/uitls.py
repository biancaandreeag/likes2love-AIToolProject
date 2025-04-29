import re

class Post:
    def __init__(self, post_url: str):
        self.url = post_url
        self.id = None
        self.username = None
        self.type = None
        self.description = None

        if self.url:
            id_match = re.search(r"pfbid([A-Za-z0-9]+)", self.url)
            if id_match:
                self.id = id_match.group(0)  
            else:
                self.id = "Error: ID not found"

            username_match = re.search(r"facebook\.com/([^/]+)/posts/", self.url)
            if username_match:
                self.username = username_match.group(1)
            else:
                self.username = "Error: Username not found"

    def set_type(self, post_type: str):
        self.type = post_type
        
    def set_description(self, description: str):
        self.description = description
    
    def __str__(self):
        return f"Post[ID: {self.id}, Username: {self.username}, Type: {self.type}, URL: {self.url}, Description: {self.description}]"

    def get_details(self):
        return {
            "id": self.id,
            "username": self.username,
            "url": self.url,
            "type": self.type,
            "description": self.description
        }
