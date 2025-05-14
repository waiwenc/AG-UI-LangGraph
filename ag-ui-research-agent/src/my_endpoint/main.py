import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from ag_ui.core import (
  RunAgentInput,
  Message,
  EventType,
  RunStartedEvent,
  RunFinishedEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent
)
from ag_ui.encoder import EventEncoder
import uuid
from langgraph.graph import Graph
from src.my_endpoint.langgraph_research_agent import build_research_graph, research_node, web_search, create_detailed_report
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, Action as CopilotAction
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import asyncio

# Create a custom StateDeltaEvent class for state updates
class StateDeltaEvent(BaseModel):
    type: str = "STATE_DELTA"
    message_id: str
    delta: list  # Changed from 'state' to 'delta' to match AG-UI protocol requirements

# Create a custom StateSnapshotEvent class for complete state representation
class StateSnapshotEvent(BaseModel):
    type: str = "STATE_SNAPSHOT"
    message_id: str
    snapshot: Dict[str, Any]  # Complete state object

app = FastAPI(title="AG-UI Endpoint")


@app.post("/awp")
async def my_endpoint(input_data: RunAgentInput):
    async def event_generator():
        # Create an event encoder to properly format SSE events
        encoder = EventEncoder()
        
        # Extract query from input messages
        query = input_data.messages[-1].content
        message_id = str(uuid.uuid4())

        # Send run started event
        yield encoder.encode(
          RunStartedEvent(
            type=EventType.RUN_STARTED,
            thread_id=input_data.thread_id,
            run_id=input_data.run_id
          )
        )

        # Send initial state snapshot with structured data for research report workflow
        yield encoder.encode(
            StateSnapshotEvent(
                message_id=message_id,
                snapshot={
                    "status": {
                        "phase": "initialized",
                        "error": None,
                        "timestamp": datetime.now().isoformat()
                    },
                    "research": {
                        "query": query,
                        "stage": "not_started",
                        "sources_found": 0,
                        "sources": [],  # Initialize with empty array to avoid OPERATION_PATH_UNRESOLVABLE error
                        "completed": False
                    },
                    "processing": {
                        "progress": 0,
                        "report": None,
                        "completed": False,
                        "inProgress": False
                    },
                    "ui": {
                        "showSources": False,
                        "showProgress": True,
                        "activeTab": "chat"
                    }
                }
            )
        )

        # Update state for web search started
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "gathering_information"
                    },
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "searching"
                    },
                    {
                        "op": "replace",
                        "path": "/processing/inProgress",
                        "value": True
                    },
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 0.15
                    }
                ]
            )
        )

        # Simulate progress updates during search
        for i in range(3):
            progress = 0.15 + ((i + 1) / 20)
            await asyncio.sleep(0.2)  # Small delay to simulate work
            yield encoder.encode(
                StateDeltaEvent(
                    message_id=message_id,
                    delta=[
                        {
                            "op": "replace",
                            "path": "/processing/progress",
                            "value": round(progress, 2)
                        }
                    ]
                )
            )

        # Run web search
        search_results = web_search(query)
        
        # Format search results for frontend display
        formatted_results = []
        sources_count = 0
        
        if isinstance(search_results, str):
            # Handle error case when no results are found
            formatted_results.append({
                "id": "result_0",
                "title": "No results",
                "url": "#",
                "snippet": search_results
            })
            sources_count = 0
        else:
            # Process organic results
            organic_results = search_results.get("organic", [])
            sources_count = len(organic_results)
            
            for i, result in enumerate(organic_results):
                formatted_result = {
                    "id": f"result_{i}",
                    "title": result.get("title", "No title"),
                    "url": result.get("link", result.get("url", "#")),
                    "snippet": result.get("snippet", "No preview available")
                }
                formatted_results.append(formatted_result)
        
        # Update state with search results
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "analyzing_information"
                    },
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "organizing_data"
                    },
                    {
                        "op": "replace",
                        "path": "/research/sources_found",
                        "value": sources_count
                    },
                    {
                        "op": "replace",
                        "path": "/research/sources",
                        "value": formatted_results
                    },
                    {
                        "op": "replace",
                        "path": "/ui/showSources",
                        "value": True
                    },
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 0.3
                    }
                ]
            )
        )

        # Simulate organizing data phase
        for i in range(2):
            progress = 0.3 + ((i + 1) / 20)
            await asyncio.sleep(0.2)  # Small delay to simulate work
            yield encoder.encode(
                StateDeltaEvent(
                    message_id=message_id,
                    delta=[
                        {
                            "op": "replace",
                            "path": "/processing/progress",
                            "value": round(progress, 2)
                        }
                    ]
                )
            )

        # Update state for report generation
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "generating_report"
                    },
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "creating_detailed_report"
                    },
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 0.4
                    }
                ]
            )
        )

        # Simulate progress updates during report generation - more steps to show this is a detailed process
        report_stages = [
            "outlining_report", "drafting_executive_summary", "writing_introduction", 
            "compiling_key_findings", "developing_analysis", "forming_conclusions",
            "finalizing_report"
        ]
        
        start_progress = 0.4
        end_progress = 0.9
        interval = (end_progress - start_progress) / len(report_stages)
        
        for i, stage in enumerate(report_stages):
            progress = start_progress + (interval * i)
            await asyncio.sleep(0.3)  # Small delay to simulate work
            yield encoder.encode(
                StateDeltaEvent(
                    message_id=message_id,
                    delta=[
                        {
                            "op": "replace",
                            "path": "/research/stage",
                            "value": stage
                        },
                        {
                            "op": "replace",
                            "path": "/processing/progress",
                            "value": round(progress, 2)
                        }
                    ]
                )
            )

        # Generate the detailed report
        detailed_report = create_detailed_report(search_results)
        
        # Update state with report generation complete
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "completed"
                    },
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "report_complete"
                    },
                    {
                        "op": "replace",
                        "path": "/research/completed",
                        "value": True
                    },
                    {
                        "op": "replace",
                        "path": "/processing/completed",
                        "value": True
                    },
                    {
                        "op": "replace",
                        "path": "/processing/inProgress",
                        "value": False
                    },
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 1.0
                    },
                    {
                        "op": "replace",
                        "path": "/processing/report",
                        "value": detailed_report
                    }
                ]
            )
        )

        # NOW start the text message sequence (after all state deltas)
        yield encoder.encode(
            TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=message_id,
                role="assistant"
            )
        )

        # Emit the detailed report content
        yield encoder.encode(
            TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=message_id,
                delta=detailed_report
            )
        )

        # End the text message
        yield encoder.encode(
            TextMessageEndEvent(
                type=EventType.TEXT_MESSAGE_END,
                message_id=message_id
            )
        )

        # Complete the run
        yield encoder.encode(
          RunFinishedEvent(
            type=EventType.RUN_FINISHED,
            thread_id=input_data.thread_id,
            run_id=input_data.run_id
          )
        )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

def main():
    """Run the uvicorn server."""
    import uvicorn
    uvicorn.run("src.my_endpoint.main:app", host="0.0.0.0", port=8000, reload=True)
 
if __name__ == "__main__":
    main()