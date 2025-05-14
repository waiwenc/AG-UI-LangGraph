import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResearchAgentState } from "@/lib/types";

interface ResearchReportProps {
  state: ResearchAgentState;
}

export function ResearchReport({ state }: ResearchReportProps) {
  return (
    <div className="flex flex-col gap-4 h-full max-w-4xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Research Report</h2>
          {state?.research?.query && (
            <div className="text-sm px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-md">
              Query: <span className="font-medium">{state.research.query}</span>
            </div>
          )}
        </div>

        {/* Render markdown content with proper formatting */}
        <div
          className="prose prose-slate prose-headings:font-semibold prose-headings:text-gray-800 
          prose-p:text-gray-600 prose-a:text-blue-600 prose-blockquote:border-l-blue-300 
          prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:p-0.5 prose-code:rounded
          prose-pre:bg-gray-800 prose-pre:text-gray-100 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ ...props }) => (
                <h1
                  className="text-2xl border-b pb-2 mb-4 mt-4 font-bold"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-xl mt-6 mb-3 font-bold" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-lg mt-5 mb-2 font-bold" {...props} />
              ),
              a: ({ ...props }) => (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc pl-5 my-3" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal pl-5 my-3" {...props} />
              ),
              blockquote: ({ ...props }) => (
                <blockquote
                  className="pl-4 italic border-l-4 my-3 text-gray-600"
                  {...props}
                />
              ),
              table: ({ ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table
                    className="min-w-full border border-gray-300"
                    {...props}
                  />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-gray-100" {...props} />
              ),
              th: ({ ...props }) => (
                <th
                  className="py-2 px-3 border-b border-gray-300 text-left text-sm font-semibold text-gray-700"
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td
                  className="py-2 px-3 border-b border-gray-200 text-sm"
                  {...props}
                />
              ),
            }}>
            {state.processing.report}
          </ReactMarkdown>
        </div>

        {/* Display sources when available with enhanced styling */}
        {state?.ui?.showSources &&
          state?.research?.sources &&
          state.research.sources.length > 0 && (
            <div className="sources-section mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Research Sources ({state.research.sources?.length || 0})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.research.sources.map((source) => (
                  <div
                    key={source.id}
                    className="source-card p-4 border border-gray-200 rounded-md hover:shadow-md transition-all bg-white">
                    <h4 className="text-lg font-medium text-blue-700 mb-2">
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
                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1.5 mt-2">
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

        {/* Add controls for the report */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1-2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print Report</span>
          </button>

          <button
            onClick={() =>
              navigator.clipboard.writeText(state.processing.report || "")
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            <span>Copy to Clipboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
