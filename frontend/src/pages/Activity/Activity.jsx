import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Activity } from "lucide-react";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";
import { fetchProjectsRequest } from "../../store/slices/projectSlice";
import { projectApiService } from "../../services/ProjectApiService";

const ITEMS_PER_PAGE = 15;
const ROLLBACK_CACHE_KEY = "projectRollbackCache";
const ROLLBACK_API_AVAILABLE_KEY = "rollbackApiAvailable";

export default function ActivityPage() {
  const dispatch = useDispatch();
  const { commits, loading, error } = useSelector((state) => state.commits);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");
  const [filterProject, setFilterProject] = useState("");
  const [rollbackStatus, setRollbackStatus] = useState("");
  const [rollbackApiAvailable, setRollbackApiAvailable] = useState(() => {
    return localStorage.getItem(ROLLBACK_API_AVAILABLE_KEY) !== "false";
  });

  const { projects } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchCommitsRequest());
  }, [dispatch]);

  const parseSnapshot = (snapshot) => {
    if (!snapshot) return null;
    try {
      return JSON.parse(snapshot);
    } catch {
      return null;
    }
  };

  const getRollbackCache = () => {
    try {
      return JSON.parse(localStorage.getItem(ROLLBACK_CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const fallbackRollback = async (activity) => {
    const actionType = getActionType(activity);
    const cache = getRollbackCache();
    const cached = activity?.projectId ? cache[activity.projectId] : null;

    if (actionType === "update") {
      const match = String(activity.message || "").match(/Updated project:\s*(.*?)\s*->\s*(.*)$/i);
      const parsed = parseSnapshot(activity.snapshot);
      let previousName =
        parsed?.before?.name ||
        cached?.before?.name ||
        (match ? match[1] : null);
      let previousDescription =
        parsed?.before?.description ??
        cached?.before?.description ??
        projects.find((p) => p.id === activity.projectId)?.description ??
        "";

      if (!activity.projectId || !previousName) {
        throw new Error("Rollback snapshot not found for this update activity.");
      }

      await projectApiService.updateProject(activity.projectId, {
        name: previousName,
        description: previousDescription,
      });
      return "Rollback completed via fallback update.";
    }

    if (actionType === "delete") {
      const parsed = parseSnapshot(activity.snapshot);
      let deletedName =
        parsed?.before?.name ||
        cached?.before?.name ||
        (String(activity.message || "").match(/Deleted project:\s*(.*)$/i)?.[1] || null);
      let deletedDescription =
        parsed?.before?.description ||
        cached?.before?.description ||
        "Restored from deleted activity";

      if (!deletedName) {
        throw new Error("Rollback snapshot not found for this delete activity.");
      }

      await projectApiService.createProject({
        name: deletedName,
        description: deletedDescription,
      });
      return "Deleted project restored via fallback create.";
    }

    throw new Error("Rollback is supported only for update/delete activities.");
  };

  const handleRollback = async (activity) => {
    try {
      if (rollbackApiAvailable) {
        await projectApiService.rollbackProjectActivity(activity.id, {
          projectId: activity.projectId,
          type: getActionType(activity),
          message: activity.message,
          branch: activity.branch,
          author: activity.author,
        });
      } else {
        const fallbackMessage = await fallbackRollback(activity);
        setRollbackStatus(fallbackMessage);
        dispatch(fetchProjectsRequest());
        dispatch(fetchCommitsRequest());
        setTimeout(() => setRollbackStatus(""), 2200);
        return;
      }

      setRollbackStatus("Rollback completed successfully.");
      dispatch(fetchProjectsRequest());
      dispatch(fetchCommitsRequest());
      setTimeout(() => setRollbackStatus(""), 1800);
    } catch (error) {
      if (error?.response?.status === 404) {
        setRollbackApiAvailable(false);
        localStorage.setItem(ROLLBACK_API_AVAILABLE_KEY, "false");
        try {
          const fallbackMessage = await fallbackRollback(activity);
          setRollbackStatus(fallbackMessage);
          dispatch(fetchProjectsRequest());
          dispatch(fetchCommitsRequest());
          setTimeout(() => setRollbackStatus(""), 2200);
          return;
        } catch (fallbackError) {
          const fallbackText = fallbackError?.message || "Fallback rollback failed.";
          setRollbackStatus(fallbackText);
          setTimeout(() => setRollbackStatus(""), 2800);
          return;
        }
      }

      const message = error?.response?.data?.message || "Rollback failed.";
      setRollbackStatus(message);
      setTimeout(() => setRollbackStatus(""), 2600);
    }
  };

  const getActionType = (activity) => {
    if (activity?.type) {
      return String(activity.type).toLowerCase();
    }

    const message = String(activity?.message || "").toLowerCase();
    if (message.includes("created project") || message.includes("created")) {
      return "create";
    }
    if (message.includes("updated project") || message.includes("updated")) {
      return "update";
    }
    if (message.includes("deleted project") || message.includes("deleted")) {
      return "delete";
    }
    if (message.includes("push") || message.includes("pull") || message.includes("sync")) {
      return "sync";
    }
    return "commit";
  };

  // Filter commits based on project and type
  const filteredCommits = commits.filter((commit) => {
    const actionType = getActionType(commit);
    const matchesType = filterType === "all" || actionType === filterType;
    const matchesProject = !filterProject || commit.projectId == filterProject;
    return matchesType && matchesProject;
  });

  const totalPages = Math.ceil(filteredCommits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentActivities = filteredCommits.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getActivityColor = (type) => {
    switch (type) {
      case "create":
        return "text-green-500";
      case "update":
        return "text-blue-500";
      case "delete":
        return "text-red-500";
      case "commit":
        return "text-indigo-500";
      case "sync":
        return "text-cyan-500";
      default:
        return "text-gray-500";
    }
  };

  const actionCounts = commits.reduce(
    (acc, commit) => {
      const action = getActionType(commit);
      if (acc[action] !== undefined) {
        acc[action] += 1;
      }
      return acc;
    },
    { create: 0, update: 0, delete: 0, commit: 0, sync: 0 },
  );

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-gray-400">
            Track all commits, updates, and changes
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 flex gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Activity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">All Activities</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
              <option value="commit">Commits</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Project
            </label>
            <select
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#0B0F19] border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
        )}

        {rollbackStatus && (
          <div className="bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 p-3 rounded">
            {rollbackStatus}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading activity...</div>
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
            <Activity size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No activities found.</p>
          </div>
        ) : (
          <>
            {/* ACTIVITY TIMELINE */}
            <div className="space-y-4">
              {currentActivities.map((activity, index) => (
                (() => {
                  const actionType = getActionType(activity);
                  return (
                <div
                  key={activity.id || index}
                  className="bg-[#111827] border border-gray-800 rounded-xl p-4"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{activity.message}</h3>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded">
                            {actionType}
                          </span>
                          {activity.branch && (
                            <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                              {activity.branch}
                            </span>
                          )}
                          {activity.documentId && (
                            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              Doc: {activity.documentId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-xs text-gray-400 uppercase">
                          {actionType} action
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                        {(actionType === "update" || actionType === "delete") && (
                          <button
                            onClick={() => handleRollback(activity)}
                            className="px-3 py-1 text-xs rounded bg-amber-600/20 border border-amber-500/50 text-amber-200 hover:bg-amber-600/30"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })()
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

        {/* ACTIVITY STATS */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-500">
                {actionCounts.commit + actionCounts.sync}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total Commits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {actionCounts.create}
              </p>
              <p className="text-xs text-gray-400 mt-1">Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {actionCounts.update}
              </p>
              <p className="text-xs text-gray-400 mt-1">Updated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {actionCounts.delete}
              </p>
              <p className="text-xs text-gray-400 mt-1">Deleted</p>
            </div>
          </div>
        </div>
    </div>
  );
}
