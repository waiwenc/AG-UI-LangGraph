# AG-UI Research Agent

This project implements a research assistant backend using the AG-UI protocol with LangGraph. The system processes research queries to generate comprehensive reports based on web search results.

## Overview

The AG-UI Research Agent:

- Processes natural language research queries
- Performs web searches using the Serper API
- Generates detailed, structured research reports
- Communicates with frontends via the AG-UI protocol
- Integrates with LangGraph for agent orchestration

## Prerequisites

- Python 3.10 - 3.12
- Poetry package manager
- API keys:
  - OpenAI API key
  - Serper API key (for Google search)

## Setup

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   cd ag-ui-research-agent
   poetry install
   ```

3. **Environment Setup**  
   Create a `.env` file in the project root with:
   ```
   OPENAI_API_KEY=your-openai-key
   SERPER_API_KEY=your-serper-key
   ```

## Project Structure

- `src/my_endpoint/`
  - `main.py` - FastAPI server with AG-UI endpoint
  - `langgraph_research_agent.py` - LangGraph implementation of research flow

## Running the Backend

Start the server with:

```bash
poetry run python -m src.my_endpoint.main
```

The server will be available at http://0.0.0.0:8000 with the main endpoint at `/awp`.

## AG-UI Protocol Implementation

This project implements the AG-UI protocol, sending events such as:

- `RUN_STARTED`/`RUN_FINISHED` - Lifecycle events
- `STATE_SNAPSHOT`/`STATE_DELTA` - State updates
- `TEXT_MESSAGE_START`/`TEXT_MESSAGE_CONTENT`/`TEXT_MESSAGE_END` - Text responses

## Research Flow

1. Receive research query via AG-UI input
2. Initialize and send initial state snapshot
3. Perform web search using Serper API
4. Process and organize search results
5. Generate structured research report with OpenAI
6. Stream state updates to frontend during processing
7. Return final report as both state update and text message

## API Reference

### `/awp` Endpoint

Accepts `POST` requests with `RunAgentInput` from AG-UI, returns streamed `BaseEvent` responses.

## Dependencies

- ag-ui-protocol - AG-UI protocol implementation
- openai - OpenAI client
- fastapi - API server
- langgraph - Agent workflow orchestration
- google-search-results (Serper) - Web search API
- python-dotenv - Environment variable management
