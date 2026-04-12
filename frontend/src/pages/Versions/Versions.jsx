import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import {
  fetchVersionsRequest,
  createVersionRequest,
  deleteVersionRequest,
} from "../../store/slices/versionSlice";

const ITEMS_PER_PAGE = 10;

export default function Versions() {
  const dispatch = useDispatch();
  const { branches, loading, error } = useSelector((state) => state.versions);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const { projects } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchVersionsRequest());
  }, [dispatch]);

  const totalPages = Math.ceil(branches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBranches = branches.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleCreateBranch = () => {
    if (newBranchName.trim() && selectedProject) {
      dispatch(
        createVersionRequest({
          name: newBranchName.trim(),
          projectId: selectedProject,
        }),
      );
      setNewBranchName("");
      setSelectedProject("");
      setShowCreateModal(false);
    }
  };

  const handleDeleteBranch = (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      dispatch(deleteVersionRequest(branchId));
    }
  };

  return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Versions & Branches</h1>
            <p className="text-sm text-gray-400">
              Manage project branches and versions
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus size={16} /> New Branch
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading branches...</div>
          </div>
        ) : branches.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
            <GitBranch size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">
              No branches found. Create one to get started.
            </p>
          </div>
        ) : (
          <>
            {/* BRANCHES LIST */}
            <div className="space-y-3">
              {currentBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center hover:border-indigo-500 transition"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch size={18} className="text-indigo-500" />
                    <div>
                      <h3 className="font-medium">{branch.name}</h3>
                      <p className="text-xs text-gray-400">
                        Project ID: {branch.projectId} • Created{" "}
                        {new Date(branch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      {/* CREATE BRANCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Branch</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="">Choose a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g., feature/new-ui"
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBranch}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
