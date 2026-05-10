/**
 * MCP Protocol Types
 * JSON-RPC 2.0 over stdio transport
 */

// JSON-RPC 2.0 Core Types
export interface JSONRPCRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

export interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: JSONRPCError;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JSONRPCNotification {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

// MCP-Specific Types
export interface InitializeRequest extends JSONRPCRequest {
  method: "initialize";
  params: {
    protocolVersion: string;
    capabilities: {
      tools?: {
        listChanged?: boolean;
      };
      resources?: {
        listChanged?: boolean;
      };
    };
    clientInfo: {
      name: string;
      version: string;
    };
  };
}

export interface InitializeResponse extends JSONRPCResponse {
  result: {
    protocolVersion: string;
    capabilities: {
      tools?: {
        listChanged?: boolean;
      };
      resources?: {
        listChanged?: boolean;
      };
    };
    serverInfo: {
      name: string;
      version: string;
    };
  };
}

export interface ToolsListRequest extends JSONRPCRequest {
  method: "tools/list";
  params?: Record<string, unknown>;
}

export interface ToolsListResponse extends JSONRPCResponse {
  result: {
    tools: Tool[];
  };
}

export interface ToolsCallRequest extends JSONRPCRequest {
  method: "tools/call";
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

export interface ToolsCallResponse extends JSONRPCResponse {
  result: {
    content: Array<{
      type: "text";
      text: string;
    }>;
  };
}

export interface ResourcesListRequest extends JSONRPCRequest {
  method: "resources/list";
  params?: Record<string, unknown>;
}

export interface ResourcesListResponse extends JSONRPCResponse {
  result: {
    resources: Resource[];
  };
}

export interface ResourcesReadRequest extends JSONRPCRequest {
  method: "resources/read";
  params: {
    uri: string;
  };
}

export interface ResourcesReadResponse extends JSONRPCResponse {
  result: {
    contents: Array<{
      uri: string;
      mimeType?: string;
      text?: string;
    }>;
  };
}

// MCP Tool Definition
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
  handler: (arguments_: Record<string, unknown>) => Promise<unknown>;
}

// Alias for ToolDefinition
export type ToolDefinition = Tool;

// MCP Resource Definition
export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// Notification Types
export interface InitializedNotification extends JSONRPCNotification {
  method: "notifications/initialized";
  params?: Record<string, unknown>;
}