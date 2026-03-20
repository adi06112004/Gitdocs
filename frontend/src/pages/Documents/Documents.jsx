import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createDocumentRequest,
  fetchDocumentsRequest,
} from "../../store/slices/documentSlice";

const ITEMS_PER_PAGE = 6;

export default function Documents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents, loading, error } = useSelector((state) => state.documents);

  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [branches, setBranches] = useState([
    "main",
    "feature/auth",
    "bugfix/login",
  ]);

  // Load documents from Redux store on mount
  useEffect(() => {
    dispatch(fetchDocumentsRequest());
  }, [dispatch]);

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
      const newDoc = {
        name: newDocName.trim(),
        content: newDocContent.trim() || "",
        branch: "main",
        project: selectedProject,
        author: "Current User",
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
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <div className="pt-20 px-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-sm text-gray-400">
              Manage and edit your documents
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition"
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
            className="bg-[#111827] border border-gray-700 px-3 py-2 rounded text-sm hover:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <span className="text-sm text-gray-500">
            ({filteredDocs.length} documents)
          </span>
        </div>

        {/* DOCUMENTS LIST */}
        <div className="space-y-4">
          {currentDocs.length > 0 ? (
            currentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className="bg-[#111827] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500 transition"
              >
                <div className="flex justify-between items-start">
                  {/* LEFT */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">
                      {doc.name}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {doc.content
                        ? doc.content.substring(0, 80) + "..."
                        : "No content yet"}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>📁 {doc.project || "Untitled"}</span>
                      <span>🔀 {doc.branch}</span>
                      <span>👤 {doc.author}</span>
                      <span>
                        📅 {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT - EDIT BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editor/${doc.id}`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-sm transition"
                  >
                    Edit
                  </button>
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
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111827] p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Create New Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g., API Documentation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">Choose a project...</option>
                  <option value="Backend API">Backend API</option>
                  <option value="Frontend App">Frontend App</option>
                  <option value="Database Schema">Database Schema</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content (Optional)
                </label>
                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-600 rounded px-3 py-2 text-white h-24 resize-none placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Enter document content..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={!newDocName.trim() || !selectedProject || loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
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
