import { useState, useEffect, useCallback, useRef } from "react";
import { PerformanceMonitor } from "../components/PerformanceMonitor";
import "~/styles/draft-wysiwyg.css";

export default function ReactDraftEditor() {
  const [EditorComponent, setEditorComponent] = useState<any>(null);
  const [DraftJS, setDraftJS] = useState<any>(null);
  const [editorState, setEditorState] = useState<any>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastContent = useRef("");

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).global) {
      (window as any).global = window;
    }

    // Dynamic import only on client-side
    Promise.all([import("react-draft-wysiwyg"), import("draft-js")])
      .then(([EditorModule, DraftJSModule]) => {
        console.log("Modules loaded:", { EditorModule, DraftJSModule });
        const { Editor } = EditorModule;
        const DraftJSDefault = DraftJSModule.default || DraftJSModule;

        setEditorComponent(() => Editor);
        setDraftJS(DraftJSDefault);
        setEditorState(DraftJSDefault.EditorState.createEmpty());
        setIsMounted(true);
      })
      .catch((error) => {
        console.error("Failed to load editor:", error);
        setLoadError(error.message);
      });
  }, []);

  const onEditorStateChange = useCallback(
    (newEditorState: any) => {
      if (!DraftJS) return;

      const startMeasure = performance.now();
      const currentContent = JSON.stringify(
        DraftJS.convertToRaw(newEditorState.getCurrentContent())
      );

      if (currentContent !== lastContent.current) {
        lastContent.current = currentContent;
        const duration = performance.now() - startMeasure;
        if (typeof window !== "undefined") {
          (window as any).recordUpdate_ReactDraft?.(duration);
        }
        setUpdateCount((prev) => prev + 1);
      }

      setEditorState(newEditorState);
    },
    [DraftJS]
  );

  const getContentAsHTML = () => {
    if (!editorState || !DraftJS) return "";
    const contentState = editorState.getCurrentContent();
    const raw = DraftJS.convertToRaw(contentState);
    return JSON.stringify(raw, null, 2);
  };

  if (loadError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500">Failed to load editor: {loadError}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isMounted || !EditorComponent || !editorState) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
        <div className="text-xs text-gray-400 mt-2">
          Status: isMounted={String(isMounted)}, hasEditor=
          {String(!!EditorComponent)}, hasState={String(!!editorState)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center p-4">
      <h2 className="text-2xl font-bold mb-4">📝 React Draft Wysiwyg Editor</h2>

      <PerformanceMonitor
        editorName="ReactDraft"
        updateCount={updateCount}
        onMeasureUpdate={() => {}}
      />

      <div className="w-full max-w-3xl bg-white shadow-sm mt-4">
        <EditorComponent
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          wrapperClassName="rdw-editor-wrapper"
          editorClassName="rdw-editor-main"
          toolbarClassName="rdw-editor-toolbar"
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "list",
              "textAlign",
              "colorPicker",
              "link",
              "emoji",
              "history",
            ],
            inline: {
              options: [
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "monospace",
              ],
            },
            blockType: {
              options: [
                "Normal",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "Blockquote",
                "Code",
              ],
            },
            list: {
              options: ["unordered", "ordered"],
            },
            textAlign: {
              options: ["left", "center", "right", "justify"],
            },
          }}
          placeholder="Start typing here..."
        />
      </div>
    </div>
  );
}
