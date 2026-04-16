import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createDocumentRequest,
  fetchDocumentsRequest,
} from "../../store/slices/documentSlice";
import { fetchProjectsRequest } from "../../store/slices/projectSlice";
import { fetchVersionsRequest } from "../../store/slices/versionSlice";

const ITEMS_PER_PAGE = 6;

export default function Documents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.documents);
  const { projects } = useSelector((state) => state.projects);
  const { branches } = useSelector((state) => state.versions);
  const { user } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");

  // Load documents from Redux store on mount
  useEffect(() => {
    dispatch(fetchDocumentsRequest());
    dispatch(fetchProjectsRequest());
    dispatch(fetchVersionsRequest());
  }, [dispatch]);

  // Get unique branches from documents or versions store
  const uniqueBranches = [
    "main",
    ...Array.from(
      new Set([
        ...documents.map((d) => d.branch).filter(Boolean),
        ...branches.map((b) => b.name).filter(Boolean),
      ]),
    ).filter((branch) => branch !== "main"),
  ];

  // Filter documents based on selected branch
  const filteredDocs =
    filterBranch === "all"
      ? documents
      : documents.filter((doc) => doc.branch === filterBranch);

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentDocs = filteredDocs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCreateDocument = () => {
    if (newDocName.trim() && selectedProject) {
      const project = projects.find((project) => project.id == selectedProject);
      const newDoc = {
        name: newDocName.trim(),
        content: newDocContent.trim() || "",
        branch: "main",
        projectId: selectedProject,
        projectName: project?.name || "Untitled Project",
        author: user?.name || "Current User",
        createdAt: new Date().toISOString(),
      };
      dispatch(createDocumentRequest(newDoc));
      setNewDocName("");
      setNewDocContent("");
      setSelectedProject("");
      setShowCreateModal(false);
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
          <p className="text-sm text-gray-400">
            Manage and edit your documents
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 border border-indigo-500/50 transition-all duration-300 active:scale-95 w-full sm:w-auto shrink-0"
        >
          + New Document
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded">{error}</div>
      )}

      {/* FILTER SECTION */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Filter by branch:</span>
        <select
          value={filterBranch}
          onChange={(e) => {
            setFilterBranch(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#09090b] border border-white/10 px-3 py-2 rounded-lg text-sm hover:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-zinc-200 shadow-sm"
        >
          <option value="all">All Branches</option>
          {uniqueBranches.map((branchName) => (
            <option key={branchName} value={branchName}>
              {branchName}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-500">
          ({filteredDocs.length} documents)
        </span>
      </div>

      {/* DOCUMENTS LIST */}
      <div className="overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 shadow-xl">
        <div className="grid grid-cols-[2.4fr_1fr_1fr_0.9fr_0.9fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/5">
          <div>Document</div>
          <div>Branch</div>
          <div>Project</div>
          <div>Author</div>
          <div>Updated</div>
        </div>
        {currentDocs.length > 0 ? (
          currentDocs.map((doc) => (
              <div
              key={doc.id}
              onClick={() => navigate(`/editor/${doc.id}`)}
              className="grid grid-cols-[2.4fr_1fr_1fr_0.9fr_0.9fr] gap-4 px-6 py-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors duration-200 group items-center"
            >
              <div className="space-y-1">
                <div className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                  {doc.name}
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {doc.content
                    ? doc.content.substring(0, 80) + "..."
                    : "No content yet"}
                </p>
              </div>
              <div className="text-sm text-gray-300">
                <span className="inline-flex rounded-full bg-indigo-700/20 px-2 py-1 text-xs text-indigo-200">
                  {doc.branch || "main"}
                </span>
              </div>
              <div className="text-sm text-gray-300 truncate">
                {projects.find((project) => project.id === doc.projectId)
                  ?.name ||
                  doc.projectName ||
                  "Untitled"}
              </div>
              <div className="text-sm text-gray-300 truncate">
                {doc.createdBy === user?.id ? "You" : (doc.authorName || doc.author || doc.createdBy || "Unknown")}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(doc.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {filterBranch === "all"
                ? "No documents yet. Create your first document!"
                : "No documents in this branch."}
            </p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded text-sm transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
          <div className="bg-[#09090b] border border-white/10 shadow-2xl p-7 rounded-2xl w-96 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <h2 className="text-xl font-bold mb-6 text-zinc-100">Create New Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g., API Documentation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Select Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">Choose a project...</option>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No projects available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Content (Optional)
                </label>
                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-24 resize-none placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Enter document content..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-4 py-2 rounded-lg text-sm transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!newDocName.trim() || !selectedProject || loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/50 shadow-lg shadow-indigo-500/20 active:scale-95 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
              >
                {loading ? "Creating..." : "Create Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
