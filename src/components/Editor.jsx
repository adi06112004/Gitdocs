import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p>Start writing your document...</p>",
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col">
      {/* TOOLBAR */}
      <div className="flex gap-2 border-b border-gray-800 p-2 bg-[#0f172a]">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("bold") ? "bg-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("italic") ? "bg-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          I
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("heading", { level: 1 })
              ? "bg-indigo-600"
              : "hover:bg-gray-700"
          }`}
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("bulletList")
              ? "bg-indigo-600"
              : "hover:bg-gray-700"
          }`}
        >
          • List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("codeBlock") ? "bg-indigo-600" : "hover:bg-gray-700"
          }`}
        >
          {"</>"}
        </button>
      </div>

      {/* EDITOR */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#0B0F19] text-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
