import type { ProjectRole } from "./types";

export const ROLE_RANK: Record<ProjectRole, number> = {
  OWNER: 3,
  EDITOR: 2,
  VIEWER: 1,
};

export const ROLE_LABEL: Record<ProjectRole, string> = {
  OWNER: "Owner",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTION: Record<ProjectRole, string> = {
  OWNER: "Full control, including billing and members.",
  EDITOR: "Can build, edit files and chat with the assistant.",
  VIEWER: "Read-only access to the workspace.",
};

export const canEdit = (role?: ProjectRole | null): boolean =>
  !!role && ROLE_RANK[role] >= ROLE_RANK.EDITOR;

export const canManageMembers = (role?: ProjectRole | null): boolean => role === "OWNER";

export const isOwner = (role?: ProjectRole | null): boolean => role === "OWNER";

export const ASSIGNABLE_ROLES: ProjectRole[] = ["EDITOR", "VIEWER"];
