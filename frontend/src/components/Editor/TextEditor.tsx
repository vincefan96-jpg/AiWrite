import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

export default function TextEditor({ content, onChange, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "在此输入文本..." }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const btn = (action: () => void, active: boolean, label: string, italic?: boolean) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      className={`px-2 py-1 rounded text-sm font-medium ${
        active ? "bg-gray-300" : "hover:bg-gray-200"
      } ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {editable && (
        <div className="border-b border-gray-200 px-4 py-2 flex gap-1 bg-gray-50">
          {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "B")}
          {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "I", true)}
          {btn(() => {
            const { from, to, empty } = editor.state.selection;
            if (!empty) {
              const text = editor.state.doc.textBetween(from, to);
              editor.chain().focus().deleteSelection().insertContentAt(from, `<h2>${text}</h2>`).run();
            } else {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }
          }, editor.isActive("heading"), "标题")}
          {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "列表")}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
