# form2love — AI Tool for Cyberbullying Detection and Post Analysis

The platform focuses on the detection of cyberbullying while offering a foundation for analyzing user opinions expressed in comments and their engagement with various posts. 

## Platform & Language Coverage
**form2love** analyzes content from the main social media networks:  
- 📘 ***Facebook***  
- 🎵 ***TikTok***

Supported languages:
- ***EN-US*** — currently the primary supported language  
- ***RO*** — actively under development to expand coverage
*(Note: Theoretically, all 47 languages supported by the DeepL API could be used; however, this tool does not guarantee reliable results for all of them. For more information, skip to x chapter .)*

## Table of Contents

- [Arhitecture](#documentation)  
- [Quick Start Quide](#getting-started)  
- [Documentation](#documentation)  
- [Additional Installation Sources](#installing)

## Architecture

### General schema
```plaintext
+-----------+         +-----------+
|           |  REST   |           |
| Frontend  +-------->+  Backend  |
| (React)   |         | (FastAPI) |
+-----------+         +-----------+
```

### Backend Arhitecture



