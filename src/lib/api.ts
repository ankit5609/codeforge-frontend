import { ChatMessage, DeployResponse, FileNode, LoginCredentials, LoginResponse, ProjectSummaryResponse, ProjectRequest, ProjectResponse, ProjectMember, ProjectRole, SignupRequest, AuthResponse, SubscriptionResponse, CheckoutResponse, PortalResponse } from "./types";
export type { FileNode };



export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080" : "");

export const getAuthToken = () => localStorage.getItem("auth_token");

export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);

export const removeAuthToken = () => localStorage.removeItem("auth_token");

export const isAuthenticated = () => !!getAuthToken();

/** Error enriched with the HTTP status so callers can show friendly messages. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Turn a failed Response into a clean ApiError. Backend errors often arrive as
 * JSON like {"status":"UNAUTHORIZED","message":"...","timeStamp":"..."} — we
 * surface just the human-readable message, never the raw JSON blob.
 */
async function buildApiError(response: Response, fallback: string): Promise<ApiError> {
  let message = "";
  try {
    const raw = await response.text();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        message = parsed?.message || parsed?.error || parsed?.detail || "";
      } catch {
        // Not JSON — use the raw text only if it isn't itself a JSON-looking blob.
        message = raw.trim().startsWith("{") ? "" : raw;
      }
    }
  } catch {
    /* ignore body read errors */
  }
  return new ApiError(message || fallback, response.status);
}

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// User info storage
export const setUserInfo = (user: { id: number; username: string; name: string }) => {
  localStorage.setItem("user_info", JSON.stringify(user));
};

export const getUserInfo = (): { id: number; username: string; name: string } | null => {
  const userInfo = localStorage.getItem("user_info");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const removeUserInfo = () => localStorage.removeItem("user_info");

// LocalStorage keys
export const PREVIEW_URL_KEY = "preview_url";
export const OPEN_TABS_KEY = "open_tabs";
export const ACTIVE_TAB_KEY = "active_tab";

// API response format for files endpoint
interface FilesApiResponse {
  files: { path: string }[];
}

// Convert flat file paths to nested tree structure
function buildFileTree(paths: { path: string }[]): FileNode[] {
  const root: FileNode[] = [];
  const nodeMap = new Map<string, FileNode>();

  // Sort paths to ensure directories come before their children
  const sortedPaths = [...paths].sort((a, b) => a.path.localeCompare(b.path));

  for (const { path } of sortedPaths) {
    const parts = path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      // Skip if node already exists
      if (nodeMap.has(currentPath)) continue;

      const isFile = i === parts.length - 1;
      const node: FileNode = {
        name: part,
        path: currentPath,
        type: isFile ? "file" : "directory",
        children: isFile ? undefined : [],
      };

      nodeMap.set(currentPath, node);

      if (parentPath) {
        const parent = nodeMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        root.push(node);
      }
    }
  }

  // Sort each level: directories first, then alphabetically
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children) sortNodes(node.children);
    });
  };

  sortNodes(root);
  return root;
}

export const api = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/account/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw await buildApiError(response, "Login failed");
    }

    return response.json();
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/account/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await buildApiError(response, "Signup failed");
    }

    return response.json();
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/account/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw await buildApiError(response, "Failed to send password reset email");
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/account/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      throw await buildApiError(response, "Failed to reset password");
    }
  },

  async getFiles(projectId: string): Promise<FileNode[]> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/files`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    const data: FilesApiResponse = await response.json();
    return buildFileTree(data.files);
  },

  async getFileContent(projectId: string, path: string): Promise<string> {
    const response = await fetch(
      `${BASE_URL}/api/v1/workspace/projects/${projectId}/files/content?path=${encodeURIComponent(path)}`,
      {
        headers: { ...getAuthHeaders() },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching file: ${response.status} ${response.statusText}`);
      throw new Error("Failed to fetch file content");
    }

    return response.text();
  },

  async deploy(projectId: string, force: boolean = false): Promise<DeployResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/deploy?force=${force}`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Deployment failed");
    }

    return response.json();
  },

  async getProjects(): Promise<ProjectSummaryResponse[]> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    return response.json();
  },

  async createProject(name: string): Promise<ProjectSummaryResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Failed to create project");
    }

    return response.json();
  },

  async getProject(id: string): Promise<ProjectResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${id}`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project");
    }

    return response.json();
  },

  async updateProject(id: string, name: string): Promise<ProjectResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Failed to update project");
    }

    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to delete project");
    }
  },

  async downloadProjectZip(id: string): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${id}/files/download-zip`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to download project");
    }

    return response.blob();
  },

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/members`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project members");
    }

    return response.json();
  },

  async inviteMember(projectId: string, username: string, role: ProjectRole): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ username, role }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to invite member");
    }
  },

  async updateMemberRole(projectId: string, userId: number, role: ProjectRole): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error("Failed to update member role");
    }
  },

  async removeMember(projectId: string, userId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/workspace/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to remove member");
    }
  },

  async getChatHistory(projectId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${BASE_URL}/api/v1/intelligence/chat/projects/${projectId}`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    return response.json();
  },

  async streamChat(
    projectId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onFile: (path: string, content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    image?: File | null
  ) {
    const controller = new AbortController();

    const hasImage = !!image;
    const trimmedMessage = message?.trim() ?? "";

    let body: BodyInit;
    const headers: Record<string, string> = { ...(getAuthHeaders() as Record<string, string>) };

    const form = new FormData();
    form.append("projectId", String(projectId));
    if (trimmedMessage) {
      form.append("message", trimmedMessage);
    }
    if (image) {
      form.append("image", image);
    }
    body = form;
    // NOTE: do NOT set Content-Type header — browser will add the correct multipart boundary automatically


    fetch(`${BASE_URL}/api/v1/intelligence/chat/stream`, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          let msg = "Chat stream failed";
          if (response.status === 400) msg = "Please enter a message or attach an image.";
          else if (response.status === 403) msg = "Daily token limit reached or no access to this project.";
          try {
            const err = await response.clone().json();
            if (err?.message) msg = err.message;
          } catch { /* ignore */ }
          throw new Error(msg);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();

        // Buffers
        let sseBuffer = ""; // To handle split SSE lines
        let fullContentBuffer = ""; // To accumulate clean text for file regex
        let lastProcessedIndex = 0; // Optimization for regex

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          sseBuffer += chunk;

          // Process line by line to handle SSE format (data: ...)
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

            const dataStr = trimmedLine.slice(5).trim();
            if (!dataStr) continue;

            try {
              // FIX: Parse JSON to get the real text with newlines preserved
              const parsed = JSON.parse(dataStr);
              const content = parsed.text;

              // 1. Send clean text to UI
              onChunk(content);

              // 2. Accumulate for file parsing (Same as before)
              fullContentBuffer += content;
              // ... (rest of regex logic) ...

            } catch (e) {
              console.error("Failed to parse SSE JSON:", e);
            }
          }
        }

        onComplete();
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Stream error:", error);
          onError(error);
        }
      });

    return () => controller.abort();
  },

  /**
   * Fetch a chat attachment image (requires auth header, so <img src> cannot
   * hit the API directly). Returns an object URL the caller must revoke.
   */
  async fetchAttachment(relativePath: string): Promise<string> {
    const url = relativePath.startsWith("http")
      ? relativePath
      : `${BASE_URL}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
    const response = await fetch(url, { headers: { ...getAuthHeaders() } });
    if (!response.ok) throw new Error("Failed to load attachment");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },


  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/account/me/subscription`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subscription");
    }

    return response.json();
  },

  async createCheckoutSession(planId: number): Promise<CheckoutResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/account/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ planId }),
    });

    if (!response.ok) {
      throw new Error("Failed to initiate checkout");
    }

    return response.json();
  },

  async createPortalSession(): Promise<PortalResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/account/payments/portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });

    if (!response.ok) {
      throw new Error("Failed to open billing portal");
    }

    return response.json();
  },

};

