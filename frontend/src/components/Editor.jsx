import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { RemoteCursors } from "../extensions/RemoteCursors";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Undo, 
  Redo 
} from "lucide-react";

const ToolbarButton = ({ onClick, isActive, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg text-sm transition-all flex items-center justify-center ${
      isActive 
        ? "bg-indigo-500/20 text-indigo-400 font-semibold shadow-inner" 
        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const Editor = ({ content, onChange, socket, docId }) => {
  const activeCursors = useRef({});

  const editor = useEditor({
    extensions: [StarterKit, RemoteCursors],
    content: content || "<p>Start writing your document...</p>",
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (socket && docId) {
        const { from } = editor.state.selection;
        socket.emit("cursor-update", { documentId: docId, position: from });
      }
    }
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const current = editor.getHTML();
      if (content !== current && !editor.isFocused) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (!socket || !editor) return;

    const handleCursorUpdate = (cursorInfo) => {
      activeCursors.current[cursorInfo.userId] = cursorInfo;
      // remove cursors that haven't updated in 5 minutes? Maybe not needed if leave-document cleans it up.
      // For now, push all active cursors to the Tiptap plugin
      editor.commands.updateCursors(Object.values(activeCursors.current));
    };

    const handleActiveUsers = ({ users }) => {
      // Remove cursors for users who have left
      const activeIds = users.map(u => u.id);
      Object.keys(activeCursors.current).forEach(userId => {
        if (!activeIds.includes(userId)) {
          delete activeCursors.current[userId];
        }
      });
      editor.commands.updateCursors(Object.values(activeCursors.current));
    };

    socket.on("cursor-update", handleCursorUpdate);
    socket.on("active-users-changed", handleActiveUsers);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("active-users-changed", handleActiveUsers);
    };
  }, [socket, editor]);

  if (!editor) return null;

  return (
    <div className="h-full flex flex-col relative w-full overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-1 border-b border-white/5 p-2 bg-white/[0.01] items-center relative z-20 shadow-sm">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
        >
          <Strikethrough size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
        >
          <Code size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <Quote size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-y-auto bg-[#09090b] relative w-full h-full custom-scrollbar">
        <EditorContent 
          editor={editor} 
          className="w-full h-full px-6 py-8 sm:px-10 lg:px-14 max-w-4xl mx-auto" 
        />
      </div>
    </div>
  );
};

export default Editor;
