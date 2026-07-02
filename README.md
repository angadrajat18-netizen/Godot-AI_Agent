# ParryForge

ParryForge is a multi-agent AI game design assistant built using Google's Agent Development Kit (ADK).

## Features

* Designer Agent

  * Creates boss concepts, lore, attack phases, and rewards.

* Balance Agent

  * Reviews fairness, pacing, telegraphs, and parry windows.

* Godot Code Agent

  * Generates Godot 4 implementation plans and starter GDScript.

* Critic Agent

  * Evaluates the final design and provides scores and improvement suggestions.

## Technologies

* Google ADK
* Gemini
* Python
* HTML
* CSS
* JavaScript

## Concepts Demonstrated

1. Multi-Agent Architecture
2. Agent Specialization
3. Agent Evaluation Workflows
4. ADK Agent Orchestration
5. Frontend + Agent Integration

## Project Goal

Help indie game developers rapidly prototype bosses, mechanics, and Godot implementations using a coordinated AI agent pipeline.
# Godot-AI_Agent

## Running ParryForge Locally

### Requirements

* Python 3.11+
* Google Agent Development Kit (ADK)
* Google Gemini API Key

### Installation

```bash
git clone https://github.com/angadrajat18-netizen/Godot-AI_Agent.git
cd Godot-AI_Agent

python -m venv .venv
.venv\Scripts\activate

pip install google-adk
```

Create a `.env` file inside the `parryforge` folder:

```
GOOGLE_API_KEY=YOUR_API_KEY
```

### Start the ADK Backend

```bash
adk api_server --allow_origins http://127.0.0.1:5500
```

### Start the Frontend

```bash
cd frontend
python -m http.server 5500
```

Open:

```
http://127.0.0.1:5500
```

If the Gemini API is temporarily unavailable or free-tier quotas are exhausted, Demo Mode can be used to demonstrate the complete workflow and user interface.
