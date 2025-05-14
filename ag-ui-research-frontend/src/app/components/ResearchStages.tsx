import React from "react";
import { ResearchAgentState } from "@/lib/types";

interface ResearchStagesProps {
  state: ResearchAgentState | undefined;
  isPhase: (
    phase: string | undefined,
    comparePhase: ResearchAgentState["status"]["phase"]
  ) => boolean;
}

export function ResearchStages({ state, isPhase }: ResearchStagesProps) {
  return (
    <div className="research-stages my-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Research Process
      </h4>
      <div className="stages-container flex flex-col gap-2">
        {/* Information Gathering Stage */}
        <div
          className={`stage-item p-3 rounded-md border ${
            isPhase(state?.status?.phase, "gathering_information")
              ? "border-blue-400 bg-blue-50"
              : isPhase(state?.status?.phase, "analyzing_information") ||
                isPhase(state?.status?.phase, "generating_report") ||
                isPhase(state?.status?.phase, "completed")
              ? "border-green-400 bg-green-50"
              : "border-gray-200"
          }`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isPhase(state?.status?.phase, "gathering_information")
                  ? "bg-blue-500 text-white"
                  : isPhase(state?.status?.phase, "analyzing_information") ||
                    isPhase(state?.status?.phase, "generating_report") ||
                    isPhase(state?.status?.phase, "completed")
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}>
              {isPhase(state?.status?.phase, "analyzing_information") ||
              isPhase(state?.status?.phase, "generating_report") ||
              isPhase(state?.status?.phase, "completed")
                ? "✓"
                : "1"}
            </span>
            <span className="font-medium text-sm">Gathering Information</span>
          </div>
          {isPhase(state?.status?.phase, "gathering_information") && (
            <p className="text-xs text-gray-600 mt-1 ml-7">
              Finding relevant sources
            </p>
          )}
        </div>

        {/* Analysis Stage */}
        <div
          className={`stage-item p-3 rounded-md border ${
            isPhase(state?.status?.phase, "analyzing_information")
              ? "border-blue-400 bg-blue-50"
              : isPhase(state?.status?.phase, "generating_report") ||
                isPhase(state?.status?.phase, "completed")
              ? "border-green-400 bg-green-50"
              : "border-gray-200"
          }`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isPhase(state?.status?.phase, "analyzing_information")
                  ? "bg-blue-500 text-white"
                  : isPhase(state?.status?.phase, "generating_report") ||
                    isPhase(state?.status?.phase, "completed")
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}>
              {isPhase(state?.status?.phase, "generating_report") ||
              isPhase(state?.status?.phase, "completed")
                ? "✓"
                : "2"}
            </span>
            <span className="font-medium text-sm">Analyzing Data</span>
          </div>
          {isPhase(state?.status?.phase, "analyzing_information") && (
            <p className="text-xs text-gray-600 mt-1 ml-7">
              Organizing research materials
            </p>
          )}
        </div>

        {/* Report Creation Stage */}
        <div
          className={`stage-item p-3 rounded-md border ${
            isPhase(state?.status?.phase, "generating_report")
              ? "border-blue-400 bg-blue-50"
              : isPhase(state?.status?.phase, "completed")
              ? "border-green-400 bg-green-50"
              : "border-gray-200"
          }`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isPhase(state?.status?.phase, "generating_report")
                  ? "bg-blue-500 text-white"
                  : isPhase(state?.status?.phase, "completed")
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}>
              {isPhase(state?.status?.phase, "completed") ? "✓" : "3"}
            </span>
            <span className="font-medium text-sm">Creating Report</span>
          </div>
          {isPhase(state?.status?.phase, "generating_report") && (
            <p className="text-xs text-gray-600 mt-1 ml-7">
              {state?.research?.stage.replace(/_/g, " ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
