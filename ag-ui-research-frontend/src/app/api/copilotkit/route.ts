import { HttpAgent } from "@ag-ui/client";

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

import { NextRequest } from "next/server";

// const BASE_URL = "http://localhost:3000";

const researchAgent = new HttpAgent({
  url: "http://127.0.0.1:8000/awp",
});

const runtime = new CopilotRuntime({
  agents: {
    researchAgent,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
