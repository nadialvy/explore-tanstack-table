import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  createEditor,
  type Descendant,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import { PerformanceMonitor } from "../components/PerformanceMonitor";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "Start typing here..." }],
  } as any,
];

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as any).type) {
    case "heading-one":
      return (
        <h1 {...attributes} className="text-3xl font-bold mb-4">
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} className="text-2xl font-bold mb-3">
          {children}
        </h2>
      );
    case "block-quote":
      return (
        <blockquote
          {...attributes}
          className="border-l-4 border-gray-300 pl-4 italic my-4"
        >
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc ml-6 my-2">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="list-decimal ml-6 my-2">
          {children}
        </ol>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "code-block":
      return (
        <pre
          {...attributes}
          className="bg-gray-100 p-4 rounded my-2 overflow-x-auto"
        >
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p {...attributes} className="mb-2">
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if ((leaf as any).bold) {
    children = <strong>{children}</strong>;
  }
  if ((leaf as any).italic) {
    children = <em>{children}</em>;
  }
  if ((leaf as any).underline) {
    children = <u>{children}</u>;
  }
  if ((leaf as any).code) {
    children = (
      <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    );
  }
  return <span {...attributes}>{children}</span>;
};

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },
  isItalicMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },
  isUnderlineMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.underline === true : false;
  },
  isCodeMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.code === true : false;
  },
  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },
  toggleItalicMark(editor: Editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },
  toggleUnderlineMark(editor: Editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "underline");
    } else {
      Editor.addMark(editor, "underline", true);
    }
  },
  toggleCodeMark(editor: Editor) {
    const isActive = CustomEditor.isCodeMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "code");
    } else {
      Editor.addMark(editor, "code", true);
    }
  },
  isBlockActive(editor: Editor, format: string) {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
      })
    );

    return !!match;
  },
  toggleBlock(editor: Editor, format: string) {
    const isActive = CustomEditor.isBlockActive(editor, format);
    const isList = format === "bulleted-list" || format === "numbered-list";

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        (!Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "bulleted-list") ||
        n.type === "numbered-list",
      split: true,
    });

    const newProperties: Partial<SlateElement> = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },
};

export default function SlateEditor() {
  const [isMounted, setIsMounted] = useState(false);
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [updateCount, setUpdateCount] = useState(0);
  const lastContent = useRef(JSON.stringify(initialValue));
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const handleChange = useCallback((newValue: Descendant[]) => {
    const startMeasure = performance.now();
    const content = JSON.stringify(newValue);

    if (content !== lastContent.current) {
      lastContent.current = content;
      const duration = performance.now() - startMeasure;
      if (typeof window !== "undefined") {
        (window as any).recordUpdate_Slate?.(duration);
      }
      setUpdateCount((prev) => prev + 1);
    }

    setValue(newValue);
  }, []);

  const ToolbarButton = ({ active, onMouseDown, children }: any) => (
    <button
      onMouseDown={onMouseDown}
      className={`px-3 py-1 rounded hover:bg-gray-200 ${
        active ? "bg-gray-300 font-bold" : ""
      }`}
    >
      {children}
    </button>
  );

  if (!isMounted) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading Slate editor...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center p-4">
      <h2 className="text-2xl font-bold mb-4">Slate Rich Text Editor</h2>

      <PerformanceMonitor
        editorName="Slate"
        updateCount={updateCount}
        onMeasureUpdate={() => {}}
      />

      <div className="w-full max-w-3xl mt-4 border border-gray-300 rounded-lg bg-white shadow-sm">
        <Slate editor={editor} initialValue={value} onChange={handleChange}>
          <div className="flex gap-2 p-2 border-b border-gray-300 bg-gray-50 flex-wrap">
            <ToolbarButton
              active={CustomEditor.isBoldMarkActive(editor)}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBoldMark(editor);
              }}
            >
              B
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isItalicMarkActive(editor)}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleItalicMark(editor);
              }}
            >
              <i>I</i>
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isUnderlineMarkActive(editor)}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleUnderlineMark(editor);
              }}
            >
              <u>U</u>
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isCodeMarkActive(editor)}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleCodeMark(editor);
              }}
            >
              {"</>"}
            </ToolbarButton>
            <div className="w-px bg-gray-300 mx-1" />
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "heading-one")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "heading-one");
              }}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "heading-two")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "heading-two");
              }}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "block-quote")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "block-quote");
              }}
            >
              Quote
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "bulleted-list")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "bulleted-list");
              }}
            >
              • List
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "numbered-list")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "numbered-list");
              }}
            >
              1. List
            </ToolbarButton>
            <ToolbarButton
              active={CustomEditor.isBlockActive(editor, "code-block")}
              onMouseDown={(e: any) => {
                e.preventDefault();
                CustomEditor.toggleBlock(editor, "code-block");
              }}
            >
              Code Block
            </ToolbarButton>
          </div>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start typing..."
            className="min-h-[300px] p-4 outline-none"
          />
        </Slate>
      </div>

      <div className="mt-4 w-full max-w-3xl flex gap-2">
        <button
          onClick={() => {
            console.log("Editor Content:", value);
            alert("Content logged to console!");
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Log Content
        </button>
        <button
          onClick={() => {
            Transforms.delete(editor, {
              at: {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
              },
            });
            setValue(initialValue);
            setUpdateCount(0);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Editor
        </button>
      </div>
    </div>
  );
}
