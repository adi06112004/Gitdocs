import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDocument } from "../../store/slices/documentSlice";
import Editor from "../../components/Editor";
import { Save, GitCommit, ArrowLeft } from "lucide-react";
import { WebRoutes } from "../../routes/WebRoutes";

export default function EditorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const docId = searchParams.get("docId");
  const { documents } = useSelector((state) => state.documents);
  const { projects } = useSelector((state) => state.projects);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentDoc, setCurrentDoc] = useState(null);

  useEffect(() => {
    if (docId) {
      const doc = documents.find((d) => d.id === parseInt(docId));
      if (doc) {
        setCurrentDoc(doc);
        setTitle(doc.name);
        setContent(doc.content);
      }
    }
  }, [docId, documents]);

  const handleSave = () => {
    if (currentDoc) {
      dispatch(
        updateDocument({
          ...currentDoc,
          name: title,
          content: content,
          updatedAt: new Date().toISOString(),
        }),
      );
    }
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

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white flex">
      <div className="ml-64 mt-16 flex w-full h-[calc(100vh-64px)]">
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

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded"
              >
                <Save size={14} /> Save
              </button>

              <button className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded">
                <GitCommit size={14} /> Commit
              </button>
            </div>
          </div>

          {/* TIPTAP EDITOR */}
          <Editor content={content} onChange={setContent} />
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
