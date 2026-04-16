import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { updateDocumentRequest } from "../../store/slices/documentSlice";
import { createCommitRequest } from "../../store/slices/commitSlice";
import { documentApiService } from "../../services/DocumentApiService";
import Editor from "../../components/Editor";
import { Save, GitCommit, ArrowLeft } from "lucide-react";
import { WebRoutes } from "../../routes/WebRoutes";

export default function EditorPage() {
  const [searchParams] = useSearchParams();
  const { id: paramDocId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const docId = paramDocId || searchParams.get("docId");
  const { documents } = useSelector((state) => state.documents);
  const { projects } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentDoc, setCurrentDoc] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!docId) return;
    const document = documents.find((d) => d.id === docId);
    if (document) {
      setCurrentDoc(document);
      setTitle(document.name);
      setContent(document.content);
    }
  }, [docId, documents]);

  useEffect(() => {
    if (!docId || currentDoc) return;

    const loadDocument = async () => {
      try {
        const response = await documentApiService.getDocumentById(docId);
        setCurrentDoc(response);
        setTitle(response.name);
        setContent(response.content);
      } catch (error) {
        setStatusMessage("Unable to load document.");
      }
    };

    loadDocument();
  }, [docId, currentDoc]);

  useEffect(() => {
    if (!docId) return;
    const newSocket = io("http://localhost:5000");
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.emit("join-document", { 
      documentId: docId, 
      user: user || { id: `anon-${Date.now()}`, name: "Anonymous" }
    });

    newSocket.on("document-update", ({ documentId, content: remoteContent }) => {
      if (documentId === docId) {
        setContent(remoteContent);
        setStatusMessage("Collaborator edit received.");
        setTimeout(() => setStatusMessage(""), 2000);
      }
    });

    newSocket.on("document-saved", ({ documentId }) => {
      if (documentId === docId) {
        setStatusMessage("Saved by collaborator.");
        setTimeout(() => setStatusMessage(""), 2000);
      }
    });

    newSocket.on("active-users-changed", ({ documentId, users }) => {
      if (documentId === docId) {
        setActiveUsers(users);
      }
    });

    return () => {
      newSocket.emit("leave-document", { documentId: docId });
      newSocket.disconnect();
    };
  }, [docId, user]);

  const handleContentChange = (value) => {
    setContent(value);
    if (socketRef.current && docId) {
      socketRef.current.emit("document-change", {
        documentId: docId,
        content: value,
      });
    }
  };

  const handleSave = () => {
    if (!currentDoc) return;

    const payload = {
      ...currentDoc,
      name: title,
      content,
    };

    dispatch(updateDocumentRequest(payload));
    setCurrentDoc(payload);
    setStatusMessage("Saving document...");
    socketRef.current?.emit("save-document", {
      documentId: currentDoc.id,
      content,
      userId: user?.id,
    });

    setTimeout(() => setStatusMessage("Document saved successfully."), 400);
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const handleBack = () => {
    if (currentDoc) {
      const project = projects.find((p) => p.id === currentDoc.projectId);
      if (project) {
        navigate(`/project/${project.id}`);
      } else {
        navigate(WebRoutes.PROJECTS());
      }
    } else {
      navigate(WebRoutes.PROJECTS());
    }
  };

  const handleCommit = () => {
    if (!currentDoc) return;
    const message = window.prompt("Commit message", "Update document");
    if (!message || !message.trim()) return;

    dispatch(
      createCommitRequest({
        message: message.trim(),
        projectId: currentDoc.projectId,
        documentId: currentDoc.id,
        branch: currentDoc.branch || "main",
        snapshot: content,
      }),
    );
    setStatusMessage("Commit created.");
    setTimeout(() => setStatusMessage(""), 1600);
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-zinc-200 flex flex-col font-sans">
      <div className="mt-16 flex flex-1 h-[calc(100vh-64px)] w-full overflow-hidden">
        {/* LEFT EDITOR */}
        <div className="flex-1 flex flex-col border-r border-white/5 relative bg-[#09090b]">
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl z-30">
            <div className="flex items-center gap-5">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title..."
                className="bg-transparent text-lg font-bold outline-none w-[300px] sm:w-[400px] text-zinc-100 placeholder-zinc-600 focus:border-b focus:border-indigo-500/50 transition-all px-1"
              />
            </div>

            <div className="flex gap-4 items-center">
              {/* ACTIVE USERS AVATARS */}
              {activeUsers.length > 0 && (
                <div className="flex items-center mr-4">
                  <div className="flex -space-x-2 mr-2">
                    {activeUsers.slice(0, 5).map((activeUser, index) => (
                      <div 
                        key={activeUser.id || index}
                        title={activeUser.name}
                        className="w-8 h-8 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10"
                        style={{ backgroundColor: activeUser.color || '#3b82f6' }}
                      >
                        {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    ))}
                    {activeUsers.length > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                        +{activeUsers.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    {activeUsers.length} active
                  </span>
                </div>
              )}

              {statusMessage && (
                <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full animate-pulse">
                  {statusMessage}
                </span>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all active:scale-95"
              >
                <Save size={16} /> Save
              </button>

              <button
                onClick={handleCommit}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20 active:scale-95 text-white font-medium rounded-lg text-sm transition-all"
              >
                <GitCommit size={16} /> Commit
              </button>
            </div>
          </div>

          {/* TIPTAP EDITOR */}
          <Editor 
            content={content} 
            onChange={handleContentChange} 
            socket={socket}
            docId={docId}
          />
        </div>

        {/* RIGHT VERSION PANEL */}
        <div className="w-80 bg-white/[0.01] border-l border-white/5 flex flex-col relative">
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              VERSION HISTORY
            </h2>
          </div>

          <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
            <div className="space-y-4">
              {currentDoc && (
                <div className="relative pl-4 border-l-2 border-indigo-500/50">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  <p className="text-sm font-medium text-zinc-200">Last updated</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(currentDoc.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="relative pl-4 border-l-2 border-white/10">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-zinc-600" />
                <p className="text-sm font-medium text-zinc-200">Created</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {currentDoc
                    ? new Date(currentDoc.createdAt).toLocaleString()
                    : "Just now"}
                </p>
              </div>
            </div>

            {currentDoc && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-4">
                  Document Info
                </h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Branch</p>
                    <p className="text-sm font-medium text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded inline-block">
                      {currentDoc.branch}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Project ID</p>
                    <p className="text-xs text-zinc-400 font-mono truncate" title={currentDoc.projectId}>
                      {currentDoc.projectId}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
