# 🛡️ likes2love — AI Tool for Cyberbullying Detection and Post Analysis

The platform focuses on the detection of cyberbullying while offering a foundation for analyzing user opinions expressed in comments and their engagement with various posts. 

##  🌐 Platform & Language Coverage
**form2love** analyzes content from the main social media networks:  
- 📘 ***Facebook***  
- 🎵 ***TikTok***

Supported languages:
- ***EN-US*** — currently the primary supported language  
- ***RO*** — actively under development to expand coverage
*(Note: Theoretically, all 47 languages supported by the DeepL API could be used; however, this tool does not guarantee reliable results for all of them. For more information, skip to x chapter .)*

## 📚 Table of Contents

- [Architecture](#architecture)  
- [Quick Start Guide](#quick-start-guide)
- [Additional Installation and Environment Files](#additional-installation-and-environment-files)
- [Documentation](#documentation)  

## Architecture

  <img width="1015" height="277" alt="Arhitectura" src="https://github.com/user-attachments/assets/6b49822d-76c7-4cc2-bbf0-e16b4585f1c8" />

### Client - Frontend (React + Vite)
Responsive user interface for interacting with the system. Handles user inputs, displays data, and communicates with backend APIs.
-Uses JWT stored in HTTP-only cookies for user session management and authentication, issued by the FastAPI backend.
-Each browser session is uniquely identified by a UUID embedded in the JWT token. This UUID is generated once per user/browser and persists across visits.
-The UUID is used to keep track of all analyzed posts associated with that browser session.
-If the user clears their browser cache or cookies, the UUID token is lost, and consequently, all posts tracked for that session will no longer be available (effectively resetting the post history).

The backend endpoint /auth/init manages this flow by either validating an existing JWT cookie or generating a new UUID and token if none is present.

### Server Microservice (server-API)
Exposes a FastAPI backend that serves the frontend and handles client requests.It connects directly to the MongoDB database (mongo container) using the connection string provided via MONGO_URI.All inter-service communication between the server and other microservices (Scraper, Preprocessor, AI Module) happens asynchronously through Kafka, using the topic to_server.The folder server-API contains all code related to the server microservice, including the database schema and structure definitions.

### MongoDB Database

The database is accessed directly by the Server Microservice (server-API), which manages all read/write operations through a centralized schema defined within the server-API/database folder.
Database schema:
```
class Analysis(BaseModel):
    type: str
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
    post_no_comments: Optional[int] = None
    post_likes: Optional[int] = None
    post_saved: Optional[int] = None
    post_distribution: Optional[int] = None
    post_comments: Optional[List[Comment]] = None
    post_date: Optional[datetime.datetime] = None
    analysis_date: Optional[datetime.datetime] = None
    comments: Optional[List[Comment]] = []
    analyses: Optional[List[Analysis]] = []

```

### Scraper Microservice

### Preprocessing Microservice
The preprocessing logic is encapsulated in the PreprocessData class, ensuring modularity and easy maintenance. It receives batches of comments, applies the cleaning and normalization pipeline, and outputs cleaned text ready for AI analysis.
-Supports tailored preprocessing pipelines for classifier and transformer models.Currently, it is currently set to work with transformer models by default, to change it, you can do it here: 
```
#File Location: /realtime-process/preprocessing/preprocess.py
    def configuration(self, post_id, model="transformers"):
        self.post_id = post_id
        self.post_model = model
        if self.post_model == 'classifier':
            ...
```
### Module AI Microservice


### About Kafka Broker
Kafka is deployed as a single broker container (broker), enabling asynchronous message passing between microservices. Each microservice connects to Kafka using the KAFKA_BOOTSTRAP_SERVERS environment variable, pointing to broker:29092. Shared logs and utility modules are mounted as volumes (shared_logs and shared_utils) to ensure consistent access across all containers.

## Quick Start Guide

### 1. Clone the Project

Use the following command to download the project locally:

```bash
git clone https://github.com/biancaandreeag/likes2love.git
cd likes2love
```

### 2. Start the Frontend (React + Vite)

Navigate to the frontend folder, install dependencies, and run the development server:

```bash
cd frontend
npm install
npm run dev
```
The app will run locally at: http://localhost:5173

### 3. Start the Backend 

To run the backend services, make sure you have the following tools installed:

- 🐳 **Docker Desktop**

You can find installation source in the [Additional Installation Sources](#installing) section.

---

Before starting, create the `.env` files in the `/backend` folder based on the provided also [Additional Installation Sources](#installing) section.

Once ready, navigate to the backend directory and build the Docker containers:

```bash
cd backend
docker compose up --build
```

## Additional Installation & Enviroment Files

- 🐍 **PyCharm** : https://www.jetbrains.com/pycharm/download/ (optional)
- 🗄️ **MongoDB Compass** : https://www.mongodb.com/try/download/compass
- 🐳 **Docker Desktop** : https://www.docker.com/products/docker-desktop/
- 🧩 **DeepL** https://www.deepl.com/en (create account and get API)

### MongoDB Compass
  
- New Connection: mongodb://localhost:27017
- also check the .env file needed.

### Enviroment Files

This project requires specific .env configuration files to be present in designated directories to ensure proper functionality. Below is the list of required .env files along with their respective locations:

- */backend/server-API*
```
MONGO_URI=mongodb://mongo:27017/posts_db
SECRET_KEY=super-secret-key
ALGORITHM=HS256
```
- */backend/scrapers/Facebook*
```
COOKIES_FILE = ...
USER_AGENT = ...
```
- */backend/scrapers/Tiktok*
```
API_KEY= ... (for CAPTCHA : https://www.sadcaptcha.com/?ref=davidteather )
COOKIES_FILE = ...
USER_AGENT = ...

```
- */backend/realtime-process*
```
DEEPL_API_KEY = ...
```

## Documentation
