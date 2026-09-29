import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { useEffect } from "react";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  id?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a detailed description...",
  minHeight = "140px",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? "" : ed.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none text-sm text-gray-900 leading-relaxed",
          "prose prose-sm max-w-none",
          "[&_p]:mb-2 [&_p:last-child]:mb-0",
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-gray-900",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:text-gray-900",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
          "[&_li]:mb-0.5",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[#895129]/60 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-2",
          "[&_hr]:my-3 [&_hr]:border-gray-200",
        ),
      },
    },
  });

  // Keep editor content in sync when value changes from outside (e.g. initial edit load)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (value !== currentHtml && (value || currentHtml)) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400",
          className,
        )}
        style={{ minHeight }}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:border-[#895129] focus-within:ring-2 focus-within:ring-[#895129]/20 transition-all",
        className,
      )}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/80 px-2 py-1.5 text-gray-700">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("bold") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25 font-bold",
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("italic") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25",
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("strike") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25",
          )}
          title="Strikethrough"
        >
          <Strikethrough className="size-3.5" />
        </Button>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            "h-7 px-1.5 rounded text-xs hover:bg-gray-200/70",
            editor.isActive("heading", { level: 2 }) &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25 font-semibold",
          )}
          title="Heading 2"
        >
          <Heading2 className="size-3.5 mr-0.5" />
          <span className="text-[10px]">H2</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            "h-7 px-1.5 rounded text-xs hover:bg-gray-200/70",
            editor.isActive("heading", { level: 3 }) &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25 font-semibold",
          )}
          title="Heading 3"
        >
          <Heading3 className="size-3.5 mr-0.5" />
          <span className="text-[10px]">H3</span>
        </Button>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("bulletList") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25",
          )}
          title="Bullet List"
        >
          <List className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("orderedList") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25",
          )}
          title="Numbered List"
        >
          <ListOrdered className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-7 w-7 p-0 rounded hover:bg-gray-200/70",
            editor.isActive("blockquote") &&
              "bg-[#895129]/15 text-[#895129] hover:bg-[#895129]/25",
          )}
          title="Quote"
        >
          <Quote className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className="h-7 w-7 p-0 rounded hover:bg-gray-200/70 text-gray-500 hover:text-gray-800"
          title="Clear formatting"
        >
          <RemoveFormatting className="size-3.5" />
        </Button>

        <div className="h-4 w-px bg-gray-200 mx-0.5 ml-auto" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-7 w-7 p-0 rounded hover:bg-gray-200/70 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-7 w-7 p-0 rounded hover:bg-gray-200/70 disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="size-3.5" />
        </Button>
      </div>

      {/* Content Area */}
      <div
        className="p-3 bg-white cursor-text"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent
          editor={editor}
          style={{ minHeight }}
          className="[&_.is-editor-empty:first-child::before]:text-gray-400 [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
}
