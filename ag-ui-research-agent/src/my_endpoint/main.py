# filepath: c:\Users\thegr\Desktop\CopilotKit\AG-UI-LangGraph\ag-ui-research-agent\src\my_endpoint\main.py
"""
Research Agent FastAPI Server

This module implements a FastAPI server that integrates with LangGraph to provide
a research agent. The server follows the AG-UI protocol for communication, enabling
real-time updates and streaming responses from the agent to the frontend.

The main endpoint (/langgraph-research) processes research queries, manages the research
workflow state, and streams progress updates and results back to the client using
Server-Sent Events (SSE).

Author: Unknown
Date: May 2025
"""

# Standard library imports
import os
import uuid
import asyncio
from datetime import datetime
from typing import Dict, Any, List

# Third-party imports
from dotenv import load_dotenv  # Environment variable management
load_dotenv()  # Load environment variables from .env file
from fastapi import FastAPI, Request  # Web framework
from fastapi.responses import StreamingResponse  # For streaming responses
from pydantic import BaseModel  # For data validation

# AG-UI protocol components for communication with frontend
from ag_ui.core import (
  RunAgentInput,   # Represents the input to an agent run
  Message,         # Represents a message in the conversation
  EventType,       # Enum of event types used in the protocol
  RunStartedEvent, # Event signaling the start of an agent run
  RunFinishedEvent,# Event signaling the end of an agent run
  TextMessageStartEvent,   # Event signaling the start of a text message
  TextMessageContentEvent, # Event carrying the content of a text message
  TextMessageEndEvent      # Event signaling the end of a text message
)
from ag_ui.encoder import EventEncoder  # Encodes events to Server-Sent Events format

# LangGraph and LangChain components for the research agent
from langgraph.graph import Graph
from langchain_core.messages import AIMessage, HumanMessage

# Local research agent components
from src.my_endpoint.langgraph_research_agent import build_research_graph, web_search, create_detailed_report

# Custom AG-UI protocol event classes
class StateDeltaEvent(BaseModel):
    """
    Custom AG-UI protocol event for partial state updates using JSON Patch.
    
    This event allows for efficient updates to the frontend state by sending
    only the changes (deltas) that need to be applied, following the JSON Patch
    standard (RFC 6902). This approach reduces bandwidth and improves real-time
    feedback to the user.
    
    Attributes:
        type (str): Event type identifier, fixed as "STATE_DELTA"
        message_id (str): Unique identifier for the message this event belongs to
        delta (list): List of JSON Patch operations to apply to the frontend state
    """
    type: str = "STATE_DELTA"
    message_id: str
    delta: list  # List of JSON Patch operations (RFC 6902)

class StateSnapshotEvent(BaseModel):
    """
    Custom AG-UI protocol event for complete state replacement.
    
    This event replaces the entire frontend state with a new snapshot.
    It's typically used for initial state setup or when many state changes
    need to be applied at once, making a delta update inefficient.
    
    Attributes:
        type (str): Event type identifier, fixed as "STATE_SNAPSHOT"
        message_id (str): Unique identifier for the message this event belongs to
        snapshot (Dict[str, Any]): Complete state object to replace the current state
    """
    type: str = "STATE_SNAPSHOT"
    message_id: str
    snapshot: Dict[str, Any]  # Complete state object

# Create FastAPI application
app = FastAPI(title="AG-UI Endpoint")

@app.post("/langgraph-research")
async def langgraph_research_endpoint(input_data: RunAgentInput):
    """
    LangGraph-based research processing endpoint.
    
    This endpoint implements a research agent that processes user queries through a
    LangGraph workflow and streams real-time updates back to the frontend using the
    AG-UI protocol. The implementation follows a streaming Server-Sent Events (SSE)
    pattern to provide continuous feedback about the research progress.
    
    The workflow consists of several stages:
    1. Initialization of the research process and state
    2. Information gathering with visible progress indicators
    3. Analysis and organization of collected information
    4. Generation of a detailed research report
    5. Delivery of the final results or error reporting
    
    Throughout these stages, the frontend state is continuously updated using
    StateDeltaEvent to show progress to the user, providing a responsive experience.
    
    Args:
        input_data (RunAgentInput): Contains conversation thread data including:
            - thread_id: Unique identifier for the conversation thread
            - run_id: Unique identifier for this specific agent run
            - messages: List of previous messages in the conversation
            
    Returns:
        StreamingResponse: A streaming HTTP response containing Server-Sent Events
                          that update the frontend with progress and results
    """
    async def event_generator():
        """
        Asynchronous generator that produces a stream of AG-UI protocol events.
        
        This generator implements the core research workflow logic and streams
        protocol-compliant events to update the frontend throughout the process.
        It handles:
        - Initialization of the research session
        - Progress reporting for all research stages
        - LangGraph workflow execution for the actual research
        - Result processing and error handling
        - Completion signaling
        
        Yields:
            bytes: Encoded Server-Sent Events following the AG-UI protocol
        """
        # Create an event encoder to properly format SSE events
        encoder = EventEncoder()
        
        # Extract the research query from the most recent message
        query = input_data.messages[-1].content
        message_id = str(uuid.uuid4())  # Generate a unique ID for this message
        
        print(f"[DEBUG] LangGraph Research started with query: {query}")

        # Signal the start of the agent run using the AG-UI protocol's RunStartedEvent
        # This indicates to the frontend that the agent has begun processing
        yield encoder.encode(
          RunStartedEvent(
            type=EventType.RUN_STARTED,
            thread_id=input_data.thread_id,
            run_id=input_data.run_id
          )
        )

        # Set up initial state snapshot (same as in the original endpoint)
        # This establishes the complete state structure that will be updated incrementally later
        # The state includes sections for:
        # - status: Overall status tracking for the research process
        # - research: Details about the research operation itself
        # - processing: Progress and results tracking
        # - ui: Frontend UI configuration
        yield encoder.encode(
            StateSnapshotEvent(
                message_id=message_id,
                snapshot={
                    "status": {
                        "phase": "initialized",  # Current phase of research process
                        "error": None,           # Error tracking, null if no errors
                        "timestamp": datetime.now().isoformat()  # When process started
                    },
                    "research": {
                        "query": query,          # The user's original research question
                        "stage": "not_started",  # Current research stage
                        "sources_found": 0,      # Number of sources discovered
                        "sources": [],           # List of research sources
                        "completed": False       # Whether research is complete
                    },
                    "processing": {
                        "progress": 0,           # Progress from 0.0 to 1.0
                        "report": None,          # Final research report 
                        "completed": False,      # Whether processing is complete
                        "inProgress": False      # Whether processing is ongoing
                    },
                    "ui": {
                        "showSources": False,    # Whether to show sources panel
                        "showProgress": True,    # Whether to show progress indicators
                        "activeTab": "chat"      # Which UI tab is currently active
                    }
                }
            )
        )
        
        # Update state to show research is starting - INFORMATION GATHERING PHASE
        # This transitions the UI to show the research is actively collecting information
        # The JSON Patch operations update specific parts of the state:
        # - Changes status phase to "gathering_information"
        # - Updates research stage to "searching"
        # - Sets processing as in-progress
        # - Sets initial progress at 15%
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
        
        # Simulate incremental progress in the information gathering phase
        # In a production system, this would map to actual search progress
        # We add small progress updates to provide responsive feedback to the user
        for i in range(2):
            progress = 0.15 + ((i + 1) / 20)  # Increment progress by 5% each iteration
            await asyncio.sleep(0.2)  # Small delay to simulate work and create visual feedback
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
            print(f"[DEBUG] Building LangGraph research graph for query: {query}")
        
        # Update state to indicate analysis phase has begun - DATA ORGANIZATION PHASE
        # This transitions the UI to show that initial data collection is complete
        # and the system is now organizing and analyzing the gathered information
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    # Update phase to analyzing_information
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "analyzing_information"
                    },
                    # Update stage to organizing_data
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "organizing_data"
                    },
                    # Update progress to 30%
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 0.3
                    }
                ]
            )
        )
        
        # Simulate more progress updates during the data organization phase
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
        
        # Update state to indicate report generation has started
        yield encoder.encode(
            StateDeltaEvent(
                message_id=message_id,
                delta=[
                    # Update phase to generating_report
                    {
                        "op": "replace",
                        "path": "/status/phase",
                        "value": "generating_report"
                    },
                    # Update stage to creating_detailed_report
                    {
                        "op": "replace",
                        "path": "/research/stage",
                        "value": "creating_detailed_report"
                    },
                    # Update progress to 40%
                    {
                        "op": "replace",
                        "path": "/processing/progress",
                        "value": 0.4
                    }
                ]
            )
        )
        
        # Simulate progress through detailed report generation stages
        # Each stage represents a different part of the report creation process
        report_stages = [
            "outlining_report", "drafting_executive_summary", "writing_introduction", 
            "compiling_key_findings", "developing_analysis", "forming_conclusions",
            "finalizing_report"
        ]
        
        # Calculate progress intervals to show smooth advancement
        start_progress = 0.4
        end_progress = 0.9
        interval = (end_progress - start_progress) / len(report_stages)
        
        # Update state for each report generation stage
        for i, stage in enumerate(report_stages):
            progress = start_progress + (interval * i)
            await asyncio.sleep(0.3)  # Small delay to simulate work
            yield encoder.encode(
                StateDeltaEvent(
                    message_id=message_id,
                    delta=[
                        # Update to current report generation stage
                        {
                            "op": "replace",
                            "path": "/research/stage",
                            "value": stage
                        },
                        # Update progress accordingly
                        {
                            "op": "replace",
                            "path": "/processing/progress",
                            "value": round(progress, 2)
                        }
                    ]
                )
            )
            
        # Build the research graph (LangGraph workflow)
        graph = build_research_graph()
        
        try:
            print(f"[DEBUG] Executing LangGraph workflow")
            # Execute the LangGraph workflow with the query
            # Convert the AG-UI message to a LangChain message type
            # Different LangGraph versions have different methods to run graphs
            try:
                # Try newer LangGraph API first
                result = graph.invoke([HumanMessage(content=query)])
                print(f"[DEBUG] LangGraph invoke API succeeded")
            except AttributeError as e:
                print(f"[DEBUG] LangGraph invoke API failed, trying older API: {str(e)}")
                # Fall back to older LangGraph API
                result = graph([HumanMessage(content=query)])
                print(f"[DEBUG] LangGraph older API succeeded")
            
            print(f"[DEBUG] LangGraph result type: {type(result)}, content: {str(result)[:100]}...")
            
            if isinstance(result, list) and len(result) > 0:
                # Get the report from the AI message content
                print(f"[DEBUG] Result is a list with {len(result)} items")
                report_item = result[0]
                print(f"[DEBUG] First item type: {type(report_item)}")
                
                if hasattr(report_item, 'content'):
                    report_content = report_item.content
                    print(f"[DEBUG] Report content extracted, length: {len(report_content)}")
                
                    # Update state to indicate search and analysis is complete
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
                                    "value": report_content
                                }
                            ]
                        )
                    )
                    
                    # Send the text message with the report content
                    yield encoder.encode(
                        TextMessageStartEvent(
                            type=EventType.TEXT_MESSAGE_START,
                            message_id=message_id,
                            role="assistant"
                        )
                    )
                    
                    yield encoder.encode(
                        TextMessageContentEvent(
                            type=EventType.TEXT_MESSAGE_CONTENT,
                            message_id=message_id,
                            delta=report_content
                        )
                    )
                    
                    yield encoder.encode(
                        TextMessageEndEvent(
                            type=EventType.TEXT_MESSAGE_END,
                            message_id=message_id
                        )
                    )
                else:
                    print(f"[DEBUG] Result item has no content attribute: {report_item}")
                    error_msg = "Research results format is invalid."
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
                                    "path": "/status/error",
                                    "value": error_msg
                                },
                                {
                                    "op": "replace",
                                    "path": "/research/stage",
                                    "value": "error"
                                },
                                {
                                    "op": "replace",
                                    "path": "/research/completed",
                                    "value": False
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
                                    "value": 0
                                }
                            ]
                        )
                    )
            else:
                # Handle case where no result was returned
                print(f"[DEBUG] LangGraph result is not a list or is empty: {result}")
                error_msg = "No research results were generated."
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
                                "path": "/status/error",
                                "value": error_msg
                            },
                            {
                                "op": "replace",
                                "path": "/research/stage",
                                "value": "error"
                            },
                            {
                                "op": "replace",
                                "path": "/research/completed",
                                "value": False
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
                                "value": 0
                            }
                        ]
                    )
                )
        except Exception as e:
            # Handle errors in the LangGraph workflow
            print(f"[DEBUG] LangGraph workflow exception: {str(e)}")
            error_msg = f"Research process failed: {str(e)}"
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
                            "path": "/status/error",
                            "value": error_msg
                        },
                        {
                            "op": "replace",
                            "path": "/research/stage",
                            "value": "error"
                        },
                        {
                            "op": "replace",
                            "path": "/research/completed",
                            "value": False
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
                            "value": 0
                        }
                    ]
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

    # Return a streaming response containing SSE events from the generator
    # The event_generator function yields events that are encoded according to the SSE protocol
    # The media_type specifies that this is a stream of server-sent events
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

def main():
    """
    Entry point for running the FastAPI server.
    
    This function starts a uvicorn server to host the FastAPI application
    with the following configuration:
    - Host: 0.0.0.0 (accessible from other machines)
    - Port: 8000
    - Hot reload: Enabled for development
    """
    import uvicorn
    uvicorn.run("src.my_endpoint.main:app", host="0.0.0.0", port=8000, reload=True)
 
if __name__ == "__main__":
    main()