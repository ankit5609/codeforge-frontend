import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { FileCode } from "lucide-react";
import { githubDark } from '@uiw/codemirror-theme-github';
import { Skeleton } from "@/components/ui/skeleton";
import { StateView } from "@/components/StateView";
function CodeLoadingSkeleton() {
    const widths = ["40%", "70%", "55%", "85%", "30%", "65%", "75%", "45%", "60%", "80%", "35%", "50%"];
    return (<div className="h-full w-full p-4 space-y-3 border-l bg-background" aria-hidden="true">
      {widths.map((w, i) => (<div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-6 rounded shrink-0 opacity-50"/>
          <Skeleton className="h-3 rounded" style={{ width: w }}/>
        </div>))}
    </div>);
}
export function CodeEditor({ content, filePath, isLoading, onCodeChange }) {
    if (isLoading) {
        return <CodeLoadingSkeleton />;
    }
    if (!filePath) {
        return (<StateView icon={FileCode} title="No file selected" description="Pick a file from the tree to view its contents."/>);
    }
    // Auto-detect language extension
    const getLanguage = (path) => {
        const ext = path.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
                return [javascript({ jsx: true, typescript: true })];
            case 'json':
                return [json()];
            case 'css':
            case 'scss':
                return [css()];
            case 'html':
            case 'svg':
                return [javascript({ jsx: true })];
            default:
                return [];
        }
    };
    return (<div className="h-full w-full overflow-hidden border-l">
      <CodeMirror value={content} height="100%" theme={githubDark} editable={false} extensions={getLanguage(filePath)} onChange={(value) => onCodeChange?.(value)} basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
        }} className="text-sm h-full"/>
    </div>);
}
