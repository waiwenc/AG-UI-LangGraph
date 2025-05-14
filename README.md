# AG-UI Research Assistant Project

This project demonstrates a comprehensive research assistant implementation using AG-UI protocol, LangGraph, and CopilotKit. The system allows users to ask research questions and receive detailed reports with sources.

## Project Structure

The project consists of two main components:

### 1. Backend: ag-ui-research-agent

Python-based backend that:

- Processes research queries
- Performs web searches using Serper API
- Generates detailed research reports using OpenAI
- Implements AG-UI protocol with FastAPI
- Uses LangGraph for the research workflow

### 2. Frontend: ag-ui-research-frontend

Next.js/React frontend that:

- Provides a user-friendly research interface
- Connects to the backend using CopilotKit
- Visualizes research progress with real-time updates
- Displays formatted research reports with sources
- Implements responsive UI for research workflow

## AG-UI Protocol

This project demonstrates AG-UI protocol implementation:

- Event-driven architecture for real-time updates
- State management using snapshots and deltas
- Standardized message events for communication
- Progress tracking through state updates

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd ag-ui-research-agent
   ```

2. Install dependencies:

   ```bash
   poetry install
   ```

3. Create a `.env` file with API keys:

   ```
   OPENAI_API_KEY=your-openai-key
   SERPER_API_KEY=your-serper-key
   ```

4. Run the backend:
   ```bash
   poetry run python -m src.my_endpoint.main
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ag-ui-research-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 to access the application

## System Architecture

```
┌─────────────────┐       AG-UI       ┌─────────────────┐
│                 │      Protocol      │                 │
│  React Frontend │<----------------->│ Python Backend  │
│   (CopilotKit)  │     (HTTP/SSE)    │   (LangGraph)   │
└─────────────────┘                    └─────────────────┘
        │                                       │
        │                                       │
┌─────────────────┐                     ┌─────────────────┐
│                 │                     │                 │
│    User         │                     │   Web Search    │
│   Interface     │                     │   (Serper API)  │
└─────────────────┘                     └─────────────────┘
                                                │
                                        ┌─────────────────┐
                                        │                 │
                                        │  Report         │
                                        │  Generation     │
                                        │  (OpenAI)       │
                                        └─────────────────┘
```

## Features

- Natural language research query processing
- Real-time research progress tracking
- Structured research reports with sections
- Source management and citation
- Modern, responsive UI
- Streaming updates using AG-UI protocol

## Technologies

- **Backend**: Python, FastAPI, LangGraph, OpenAI, Serper API
- **Frontend**: Next.js, React, CopilotKit
- **Protocol**: AG-UI (Agent User Interaction Protocol)

## License

[Specify license or state that it's private/internal]
