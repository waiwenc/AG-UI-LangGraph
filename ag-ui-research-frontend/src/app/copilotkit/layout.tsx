// Import the CSS styles for CopilotKit UI components
import "@copilotkit/react-ui/styles.css";
// Import React and ReactNode type for typing children prop
import React, { ReactNode } from "react";
// Import the CopilotKit provider component from the core package
import { CopilotKit } from "@copilotkit/react-core";

// Get the runtime URL from environment variables
// This URL points to the CopilotKit runtime API endpoint
const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CopilotKit
      runtimeUrl={runtimeUrl} // URL for the CopilotKit runtime API
      agent="researchAgent" // Specify which agent to use (matches the one defined in route.ts)
      showDevConsole={false} // Hide the development console in production
    >
      {children}{" "}
      {/* Render the child components inside the CopilotKit provider */}
    </CopilotKit>
  );
}
