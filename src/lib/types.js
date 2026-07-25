export var ChatEventType;
(function (ChatEventType) {
    ChatEventType["THOUGHT"] = "THOUGHT";
    ChatEventType["MESSAGE"] = "MESSAGE";
    ChatEventType["FILE_EDIT"] = "FILE_EDIT";
    ChatEventType["TOOL_LOG"] = "TOOL_LOG";
})(ChatEventType || (ChatEventType = {}));
