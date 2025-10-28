import { useState, useEffect, useRef } from "react";
import { PerformanceMonitor } from "../components/PerformanceMonitor";
import "~/styles/quill.css";

export default function QuillEditor() {
  const [updateCount, setUpdateCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const lastContent = useRef("");
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !editorRef.current ||
      quillInstance.current
    ) {
      return;
    }

    // Dynamic import and initialize Quill
    import("quill")
      .then((QuillModule) => {
        const Quill = QuillModule.default;

        if (!editorRef.current || quillInstance.current) return;

        quillInstance.current = new Quill(editorRef.current, {
          theme: "snow",
          placeholder: "Start writing...",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              ["link", "image"],
              ["clean"],
            ],
          },
        });

        quillInstance.current.on("text-change", () => {
          const startMeasure = performance.now();
          const content = quillInstance.current?.root?.innerHTML || "";

          if (content !== lastContent.current) {
            lastContent.current = content;
            const duration = performance.now() - startMeasure;
            (window as any).recordUpdate_Quill?.(duration);
            setUpdateCount((prev) => prev + 1);
          }
        });

        setIsMounted(true);
      })
      .catch((error) => {
        console.error("Failed to load Quill:", error);
      });

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
        quillInstance.current = null;
      }
    };
  }, []);

  const getEditorContent = () => {
    if (quillInstance.current) {
      return {
        html: quillInstance.current.root.innerHTML,
        text: quillInstance.current.getText(),
        delta: quillInstance.current.getContents(),
      };
    }
    return null;
  };

  const clearEditor = () => {
    if (quillInstance.current) {
      quillInstance.current.setText("");
      setUpdateCount(0);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Quill Rich Text Editor</h2>

      <PerformanceMonitor
        editorName="Quill"
        updateCount={updateCount}
        onMeasureUpdate={() => {}}
      />

      <div className="w-full max-w-3xl mt-4">
        <div className="quill-wrapper">
          <div ref={editorRef} />
        </div>
        {!isMounted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-gray-500">Loading Quill editor...</div>
          </div>
        )}
      </div>

    </div>
  );
}
