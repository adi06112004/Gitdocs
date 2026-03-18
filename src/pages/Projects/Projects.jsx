import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createProjectRequest } from "../../store/slices/projectSlice";
import { WebRoutes } from "../../routes/WebRoutes";

const ITEMS_PER_PAGE = 5;

export default function Projects() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.projects);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      dispatch(
        createProjectRequest({
          name: newProjectName.trim(),
          description:
            newProjectDescription.trim() || "Git-aware document repository",
        }),
      );
      setNewProjectName("");
      setNewProjectDescription("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      {/* MAIN */}
      <div className="ml-64 pt-20 px-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-gray-400">Manage your repositories</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm"
          >
            + New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
        )}

        {/* PROJECT LIST (VERTICAL) */}
        <div className="space-y-4">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-[#111827] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500 transition"
            >
              <div className="flex justify-between items-center">
                {/* LEFT */}
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {project.description}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-sm text-gray-400">
                  Updated {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                No projects yet. Create your first project!
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
            >
              Prev
            </button>

            {/* Pages */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? "bg-indigo-600"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111827] p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-600 rounded px-3 py-2 text-white h-20 resize-none"
                  placeholder="Enter project description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
