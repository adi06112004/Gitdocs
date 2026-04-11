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
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.emit("join-document", docId);

    socket.on("document-update", ({ documentId, content: remoteContent }) => {
      if (documentId === docId) {
        setContent(remoteContent);
        setStatusMessage("Collaborator edit received.");
        setTimeout(() => setStatusMessage(""), 2000);
      }
    });

    socket.on("document-saved", ({ documentId }) => {
      if (documentId === docId) {
        setStatusMessage("Saved by collaborator.");
        setTimeout(() => setStatusMessage(""), 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [docId]);

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
    <div className="bg-[#0B0F19] min-h-screen text-white flex">
      <div className="mt-16 flex w-full h-[calc(100vh-64px)]">
        {/* LEFT EDITOR */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          {/* TOP BAR */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0f172a]">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document Title..."
                className="bg-transparent text-lg font-semibold outline-none w-1/2"
              />
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-xs text-gray-400">{statusMessage}</span>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Save size={14} /> Save
              </button>

              <button
                onClick={handleCommit}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded"
              >
                <GitCommit size={14} /> Commit
              </button>
            </div>
          </div>

          {/* TIPTAP EDITOR */}
          <Editor content={content} onChange={handleContentChange} />
        </div>

        {/* RIGHT VERSION PANEL */}
        <div className="w-80 bg-[#0f172a] p-4">
          <h2 className="text-sm font-semibold mb-4 text-gray-300">
            VERSION HISTORY
          </h2>

          <div className="space-y-4">
            {currentDoc && (
              <div className="border-l border-gray-700 pl-3">
                <p className="text-sm">Last updated</p>
                <p className="text-xs text-gray-400">
                  {new Date(currentDoc.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="border-l border-gray-700 pl-3">
              <p className="text-sm">Created</p>
              <p className="text-xs text-gray-400">
                {currentDoc
                  ? new Date(currentDoc.createdAt).toLocaleString()
                  : "Just now"}
              </p>
            </div>
          </div>

          {currentDoc && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">
                Document Info
              </h3>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Branch: {currentDoc.branch}</p>
                <p>Project ID: {currentDoc.projectId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
