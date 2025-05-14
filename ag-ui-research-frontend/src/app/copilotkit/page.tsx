"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";
import ResearchAssistant from "../components/Researcher";
import { Header } from "../components/Header";

export default function CopilotKitPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <ResearchAssistant />
        <CopilotSidebar
          clickOutsideToClose={true}
          defaultOpen={false}
          labels={{
            title: "Popup Assistant",
            initial: "Hi! How can I assist you today?",
          }}
        />
      </main>
    </div>
  );
}
