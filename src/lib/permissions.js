export const ROLE_RANK = {
    OWNER: 3,
    EDITOR: 2,
    VIEWER: 1,
};
export const ROLE_LABEL = {
    OWNER: "Owner",
    EDITOR: "Editor",
    VIEWER: "Viewer",
};
export const ROLE_DESCRIPTION = {
    OWNER: "Full control, including billing and members.",
    EDITOR: "Can build, edit files and chat with the assistant.",
    VIEWER: "Read-only access to the workspace.",
};
export const canEdit = (role) => !!role && ROLE_RANK[role] >= ROLE_RANK.EDITOR;
export const canManageMembers = (role) => role === "OWNER";
export const isOwner = (role) => role === "OWNER";
export const ASSIGNABLE_ROLES = ["EDITOR", "VIEWER"];
