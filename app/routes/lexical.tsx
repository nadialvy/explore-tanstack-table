import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import type { EditorState } from "lexical";
import {
  FORMAT_TEXT_COMMAND,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import { useCallback, useEffect, useState, useRef } from "react";
import { mergeRegister } from "@lexical/utils";
import { PerformanceMonitor } from "../components/PerformanceMonitor";

const theme = {
  paragraph: "mb-2",
  quote: "border-l-4 border-gray-300 pl-4 italic",
  heading: {
    h1: "text-3xl font-bold mb-4",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
  },
  list: {
    ol: "list-decimal ml-4",
    ul: "list-disc ml-4",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-gray-100 px-1 py-0.5 rounded font-mono text-sm",
  },
};

function onError(error: Error) {
  console.error(error);
}

const initialConfig = {
  namespace: "LexicalEditor",
  theme,
  onError,
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
  ],
};

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return (
    <div className="flex gap-2 p-2 border-b border-gray-300 mb-2 flex-wrap">
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`px-3 py-1 rounded hover:bg-gray-200 font-bold ${
          isBold ? "bg-gray-300" : ""
        }`}
        type="button"
      >
        B
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`px-3 py-1 rounded hover:bg-gray-200 italic ${
          isItalic ? "bg-gray-300" : ""
        }`}
        type="button"
      >
        I
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`px-3 py-1 rounded hover:bg-gray-200 underline ${
          isUnderline ? "bg-gray-300" : ""
        }`}
        type="button"
      >
        U
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`px-3 py-1 rounded hover:bg-gray-200 line-through ${
          isStrikethrough ? "bg-gray-300" : ""
        }`}
        type="button"
      >
        S
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h1"));
            }
          });
        }}
        className="px-3 py-1 rounded hover:bg-gray-200"
        type="button"
      >
        H1
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode("h2"));
            }
          });
        }}
        className="px-3 py-1 rounded hover:bg-gray-200"
        type="button"
      >
        H2
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          });
        }}
        className="px-3 py-1 rounded hover:bg-gray-200"
        type="button"
      >
        Quote
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        }}
        className="px-3 py-1 rounded hover:bg-gray-200"
        type="button"
      >
        Normal
      </button>
    </div>
  );
}

export default function LexicalEditor() {
  const [updateCount, setUpdateCount] = useState(0);
  const [lastContent, setLastContent] = useState("");

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const startMeasure = performance.now();
      editorState.read(() => {
        const json = JSON.stringify(editorState.toJSON());
        if (json !== lastContent) {
          setLastContent(json);
          const duration = performance.now() - startMeasure;
          (window as any).recordUpdate_Lexical?.(duration);
          setUpdateCount((prev) => prev + 1);
        }
      });
    },
    [lastContent]
  );

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Lexical Rich Text Editor</h2>

      <PerformanceMonitor
        editorName="Lexical"
        updateCount={updateCount}
        onMeasureUpdate={() => {}}
      />

      <div className="border border-gray-300 rounded-md w-full max-w-3xl bg-white shadow-sm mt-4">
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="relative px-4">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[300px] outline-none py-3" />
              }
              placeholder={
                <div className="absolute top-3 left-4 text-gray-400 pointer-events-none">
                  Enter some text...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
          </div>
        </LexicalComposer>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        💡 Select text and use toolbar to format - Bold, Italic, Underline, etc!
      </p>
    </div>
  );
}
