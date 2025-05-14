import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResearchStages } from "./ResearchStages";
import { ResearchAgentState } from "@/lib/types";
import { ResearchReport } from "./ResearchReport";

function ResearchAssistant() {
  // Reference to track if research is in progress
  const isResearchInProgress = useRef(false);

  // Connect to the agent's state using CopilotKit's useCoAgent hook
  const { state, stop: stopResearchAgent } = useCoAgent<ResearchAgentState>({
    name: "researchAgent",
    initialState: {
      status: { phase: "idle", error: null },
      research: {
        query: "",
        stage: "not_started",
        sources_found: 0,
        sources: [],
        completed: false,
      },
      processing: {
        progress: 0,
        report: null,
        completed: false,
        inProgress: false,
      },
      ui: { showSources: false, showProgress: false, activeTab: "chat" },
    },
  });

  // Helper function for type-safe phase comparison
  const isPhase = (
    phase: string | undefined,
    comparePhase: ResearchAgentState["status"]["phase"]
  ): boolean => {
    return phase === comparePhase;
  };

  // Implement useCoAgentStateRender hook
  useCoAgentStateRender({
    name: "researchAgent",
    handler: ({ nodeName }) => {
      // Stop the research agent when the "__end__" node is reached
      if (nodeName === "__end__") {
        setTimeout(() => {
          isResearchInProgress.current = false; // Ensure flag is reset
          stopResearchAgent();
        }, 1000);
      }
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        isResearchInProgress.current = true;
        return (
          <div className="research-in-progress bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <p className="font-medium text-gray-800">
                Research in progress...
              </p>
            </div>

            <div className="status-container mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </div>
                {state?.processing?.progress > 0 && (
                  <div className="text-xs font-medium text-blue-600">
                    {Math.round(state.processing.progress * 100)}%
                  </div>
                )}
              </div>

              {state?.processing?.progress > 0 &&
                state?.processing?.progress < 1 && (
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${state.processing.progress * 100}%` }}
                    />
                  </div>
                )}
            </div>

            {state?.research?.sources_found > 0 && (
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3"></path>
                </svg>
                Found {state.research.sources_found} source
                {state.research.sources_found !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        );
      }

      if (status === "complete") {
        isResearchInProgress.current = false; // Ensure the flag is reset
        // Don't return any UI here - let the main component handle showing the report
        return null;
      }

      return null;
    },
  });

  // Helper function to format the status for display
  const getStatusText = () => {
    // First check the main phase
    switch (state?.status?.phase) {
      case "initialized":
        return "Ready to start research";
      case "gathering_information":
        // If gathering info, show the specific research stage
        switch (state?.research?.stage) {
          case "searching":
            return "Searching the web for information...";
          default:
            return "Gathering information...";
        }
      case "analyzing_information":
        // If analyzing, show the specific research stage
        switch (state?.research?.stage) {
          case "organizing_data":
            return "Organizing research data...";
          default:
            return "Analyzing information...";
        }
      case "generating_report":
        // If generating report, show the detailed report generation stage
        switch (state?.research?.stage) {
          case "creating_detailed_report":
            return "Starting report generation...";
          case "outlining_report":
            return "Creating report outline...";
          case "drafting_executive_summary":
            return "Writing executive summary...";
          case "writing_introduction":
            return "Drafting introduction...";
          case "compiling_key_findings":
            return "Compiling key findings...";
          case "developing_analysis":
            return "Developing detailed analysis...";
          case "forming_conclusions":
            return "Forming conclusions...";
          case "finalizing_report":
            return "Finalizing comprehensive report...";
          default:
            return "Generating detailed report...";
        }
      case "completed":
        return state?.research?.stage === "report_complete"
          ? "Research report completed"
          : "Research completed";
      default:
        return "Idle";
    }
  };

  // When the research is complete and we have a report, show it
  if (state?.status?.phase === "completed" && state?.processing?.report) {
    return <ResearchReport state={state} />;
  }

  // If research is in progress, show a loading state with enhanced UI
  if (
    state?.status &&
    state.status.phase !== "completed" &&
    (isResearchInProgress.current || state?.processing?.inProgress)
  ) {
    return (
      <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
        <div className="p-6 bg-white border rounded-lg shadow-sm w-full">
          <h3 className="text-xl font-semibold mb-4">
            Comprehensive Research in Progress
          </h3>

          <div className="status-container mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">{getStatusText()}</div>
              <div className="text-sm font-medium">
                {Math.round(state?.processing?.progress * 100)}%
              </div>
            </div>

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${state?.processing?.progress * 100}%`,
                  background:
                    state?.processing?.progress >= 0.9
                      ? "linear-gradient(90deg, #4ade80, #22c55e)"
                      : "linear-gradient(90deg, #60a5fa, #3b82f6)",
                }}
              />
            </div>
          </div>

          {/* Research Stages Tracker */}
          <ResearchStages state={state} isPhase={isPhase} />

          {/* Sources count when available */}
          {state?.research?.sources_found > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Found {state.research.sources_found} source
              {state.research.sources_found !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default state when not researching and no results yet
  return (
    <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Research Assistant</h3>
          <div className="text-sm px-3 py-1 bg-gray-100 rounded-full">
            {getStatusText()}
          </div>
        </div>

        <div className="text-gray-600 mb-4">
          <p>Ready to assist with comprehensive research on any topic.</p>
        </div>

        {/* Display sources when available */}
        {state?.ui?.showSources &&
          state?.research?.sources &&
          state.research.sources.length > 0 && (
            <div className="sources-section mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">
                Sources for:{" "}
                <span className="text-blue-600">{state?.research?.query}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.research.sources.map((source) => (
                  <div
                    key={source.id}
                    className="source-card p-4 border rounded-md hover:shadow-md transition-all">
                    <h4 className="text-md font-medium text-blue-700 mb-2">
                      {source.title}
                    </h4>
                    <div className="text-sm text-gray-700 mb-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {source.snippet}
                      </ReactMarkdown>
                    </div>
                    <div className="flex justify-end">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
                        <span>View Source</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {state?.processing?.report && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Report Preview</h3>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {state.processing.report.length > 300
                  ? state.processing.report.substring(0, 300) + "..."
                  : state.processing.report}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchAssistant;
