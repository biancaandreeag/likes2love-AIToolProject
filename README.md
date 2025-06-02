# form2love — AI Tool for Cyberbullying Detection and Post Analysis

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

### General schema
```plaintext
+-----------+         +-----------+
|           |  REST   |           |
| Frontend  +-------->+  Backend  |
| (React)   |         | (FastAPI) |
+-----------+         +-----------+
```

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
- 🖥️ **XLaunch** (for scraping containter)

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
- 🗄️ **MongoDB Compas** s: https://www.mongodb.com/try/download/compass
- 🐳 **Docker Desktop** : https://www.docker.com/products/docker-desktop/
- 🖥️ **XLaunch** (for scraping containter) :  https://sourceforge.net/projects/vcxsrv/

**MongoDB Compas**
  New Connection:
- mongodb://localhost:27017
- also check the .env file needed.
  
  **XLaunch**
  After installation, browse for XLaunch in the Start Menu and configure this:
- Display settings: implicit (Display number : 0) → Next.
- Multiple windows -> Next.
- Client startup : Start no client → Next.
- Extra settings : Disable access control ( to allow Docker Connexions ) → Next.
- Click Finish.

Now, VcXsrv will run in the background and listen on TCP port 6000 for display :0.0. In the scraping container, you can disable the headless option to analyze and modify your scraper according to recent updates.
