import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "../../components/Sidebar";

import {
  setCurrentProject,
  setCurrentBranchForProject,
  fetchProjectsRequest,
} from "../../store/slices/projectSlice";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";
import { createDocumentRequest } from "../../store/slices/documentSlice";
import { createVersionRequest } from "../../store/slices/versionSlice";
import { projectApiService } from "../../services/ProjectApiService";
import { versionApiService } from "../../services/VersionApiService";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.projects);
  const {
    documents,
    loading: docLoading,
    error,
  } = useSelector((state) => state.documents);
  const { loading: branchLoading } = useSelector((state) => state.versions);
  const { commits } = useSelector((state) => state.commits);
  const { user } = useSelector((state) => state.auth);

  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberPermission, setMemberPermission] = useState("read");
  const [syncSourceBranch, setSyncSourceBranch] = useState("main");
  const [syncTargetBranch, setSyncTargetBranch] = useState("main");
  const [syncMode, setSyncMode] = useState("push");
  const [statusMessage, setStatusMessage] = useState("");

  const project = projects.find((p) => p.id?.toString() === id);

  useEffect(() => {
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
      dispatch(
        fetchCommitsRequest({ projectId: project.id, branch: project.currentBranch }),
      );
    }
  }, [project, dispatch]);

  useEffect(() => {
    if (!project) return;
    const loadCollaborators = async () => {
      try {
        const response = await projectApiService.getCollaborators(project.id);
        setCollaborators(response || []);
      } catch (loadError) {
        setCollaborators([]);
      }
    };
    loadCollaborators();
  }, [project]);

  if (!project) {
    return (
      <div className="bg-[#0B0F19] min-h-screen text-white p-6">Loading...</div>
    );
  }

  const projectDocuments = documents.filter(
    (d) => d.projectId === project.id && d.branch === project.currentBranch,
  );

  const handleCreateDocument = () => {
    if (newDocName.trim()) {
      dispatch(
        createDocumentRequest({
          name: newDocName.trim(),
          content: newDocContent,
          projectId: project.id,
          branch: project.currentBranch,
        }),
      );
      setNewDocName("");
      setNewDocContent("");
      setShowCreateDocModal(false);
    }
  };

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      dispatch(
        createVersionRequest({
          name: newBranchName.trim(),
          projectId: project.id,
        }),
      );
      setNewBranchName("");
      setShowCreateBranchModal(false);
    }
  };

  const handleBranchChange = (branch) => {
    dispatch(setCurrentBranchForProject({ projectId: project.id, branch }));
    dispatch(fetchCommitsRequest({ projectId: project.id, branch }));
  };

  const handleSavePermission = async () => {
    if (!memberUserId.trim()) return;
    try {
      const response = await projectApiService.upsertCollaborator(project.id, {
        userId: memberUserId.trim(),
        permission: memberPermission,
      });
      setCollaborators(response || []);
      setMemberUserId("");
      setMemberPermission("read");
      setStatusMessage("Member permission updated.");
      setTimeout(() => setStatusMessage(""), 1800);
    } catch (permissionError) {
      setStatusMessage(
        permissionError?.response?.data?.message || "Failed to update permission.",
      );
      setTimeout(() => setStatusMessage(""), 2200);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      const response = await projectApiService.removeCollaborator(project.id, userId);
      setCollaborators(response || []);
    } catch (removeError) {
      setStatusMessage(
        removeError?.response?.data?.message || "Failed to remove collaborator.",
      );
      setTimeout(() => setStatusMessage(""), 2200);
    }
  };

  const handleBranchSync = async () => {
    if (!syncSourceBranch || !syncTargetBranch || syncSourceBranch === syncTargetBranch) {
      setStatusMessage("Choose two different branches.");
      setTimeout(() => setStatusMessage(""), 2000);
      return;
    }
    try {
      const response = await versionApiService.syncBranch({
        projectId: project.id,
        sourceBranch: syncSourceBranch,
        targetBranch: syncTargetBranch,
        mode: syncMode,
      });
      setStatusMessage(`Synced ${response.updatedCount} docs (${response.fromBranch} -> ${response.toBranch}).`);
      setTimeout(() => setStatusMessage(""), 2200);
      dispatch(fetchCommitsRequest({ projectId: project.id, branch: project.currentBranch }));
    } catch (syncError) {
      setStatusMessage(syncError?.response?.data?.message || "Branch sync failed.");
      setTimeout(() => setStatusMessage(""), 2200);
    }
  };

  const canManagePermissions = user?.id === project.owner || user?.role === "admin";
  const filteredCommits = commits.filter(
    (c) => c.projectId === project.id && c.branch === project.currentBranch,
  );

  return (
    <div className="bg-[#0B0F19] min-h-screen text-white">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="ml-64 pt-20 px-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-gray-400">Manage documents by branch</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Branch Selector */}
            <select
              value={project.currentBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="bg-[#111827] border border-gray-700 px-3 py-2 rounded text-sm"
            >
              {project.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Create Branch */}
            <button
              onClick={() => setShowCreateBranchModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-sm"
            >
              + Branch
            </button>

            {/* Create Document */}
            <button
              onClick={() => setShowCreateDocModal(true)}
              className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
            >
              + Document
            </button>

            <button
              onClick={() => setShowPermissionModal(true)}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
            >
              Permissions
            </button>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-200">
            Branch Collaboration (Push/Pull)
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Mode</p>
              <select
                value={syncMode}
                onChange={(e) => setSyncMode(e.target.value)}
                className="bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm"
              >
                <option value="push">Push</option>
                <option value="pull">Pull</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Source Branch</p>
              <select
                value={syncSourceBranch}
                onChange={(e) => setSyncSourceBranch(e.target.value)}
                className="bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm"
              >
                {project.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Target Branch</p>
              <select
                value={syncTargetBranch}
                onChange={(e) => setSyncTargetBranch(e.target.value)}
                className="bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm"
              >
                {project.branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBranchSync}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm"
            >
              Sync Branches
            </button>
            {statusMessage && <p className="text-xs text-indigo-300">{statusMessage}</p>}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded">{error}</div>
        )}

        {/* DOCUMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/editor?docId=${doc.id}`)}
              className="bg-[#111827] border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-indigo-500 transition"
            >
              <h3 className="font-semibold text-lg">{doc.name}</h3>

              <p className="text-xs text-gray-400 mt-2">Branch: {doc.branch}</p>

              <p className="text-xs text-gray-500 mt-1">
                Updated: {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}

          {/* EMPTY STATE */}
          {projectDocuments.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              No documents in this branch. Create one 🚀
            </div>
          )}
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-200">
            Git History ({project.currentBranch})
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCommits.slice(0, 15).map((commit) => (
              <div
                key={commit.id}
                className="border border-gray-800 rounded p-3 bg-[#0B0F19]"
              >
                <p className="text-sm text-gray-100">{commit.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(commit.createdAt).toLocaleString()} • {commit.author}
                </p>
              </div>
            ))}
            {filteredCommits.length === 0 && (
              <p className="text-sm text-gray-400">No commits yet on this branch.</p>
            )}
          </div>
        </div>
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {showCreateDocModal && (
        <Modal>
          <h2 className="text-lg font-bold mb-4">Create Document</h2>

          <input
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Document name"
            className="w-full mb-3 px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded"
          />

          <textarea
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
            placeholder="Content"
            className="w-full h-32 px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowCreateDocModal(false)}
              className="flex-1 bg-gray-600 px-3 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateDocument}
              className="flex-1 bg-green-600 px-3 py-2 rounded"
            >
              Create
            </button>
          </div>
        </Modal>
      )}

      {/* CREATE BRANCH MODAL */}
      {showCreateBranchModal && (
        <Modal>
          <h2 className="text-lg font-bold mb-4">Create Branch</h2>

          <input
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/new-feature"
            className="w-full px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowCreateBranchModal(false)}
              className="flex-1 bg-gray-600 px-3 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBranch}
              className="flex-1 bg-indigo-600 px-3 py-2 rounded"
            >
              Create
            </button>
          </div>
        </Modal>
      )}

      {showPermissionModal && (
        <Modal>
          <h2 className="text-lg font-bold mb-4">Project Permissions</h2>

          {canManagePermissions ? (
            <div className="space-y-3">
              <input
                value={memberUserId}
                onChange={(e) => setMemberUserId(e.target.value)}
                placeholder="Collaborator userId"
                className="w-full px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded"
              />
              <select
                value={memberPermission}
                onChange={(e) => setMemberPermission(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded"
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={handleSavePermission}
                className="w-full bg-indigo-600 px-3 py-2 rounded"
              >
                Save Permission
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-3">
              You can view collaborators but only owner/admin can change permissions.
            </p>
          )}

          <div className="mt-4 space-y-2 max-h-52 overflow-y-auto">
            {collaborators.map((member) => (
              <div
                key={member.userId}
                className="bg-[#0B0F19] border border-gray-700 rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm">{member.userId}</p>
                  <p className="text-xs text-gray-400 uppercase">{member.permission}</p>
                </div>
                {canManagePermissions && (
                  <button
                    onClick={() => handleRemoveCollaborator(member.userId)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {collaborators.length === 0 && (
              <p className="text-sm text-gray-400">No collaborators added.</p>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowPermissionModal(false)}
              className="w-full bg-gray-700 px-3 py-2 rounded"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* REUSABLE MODAL */
function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] p-6 rounded-lg w-[500px]">{children}</div>
    </div>
  );
}
