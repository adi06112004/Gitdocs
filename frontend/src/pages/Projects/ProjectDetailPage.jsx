import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import CollaboratorsModal, {
  ProjectCollaboratorsPanel,
} from "../../components/CollaboratorsModal";
import CollaboratorsList from "../../components/CollaboratorsList";

import {
  setCurrentProject,
  setCurrentBranchForProject,
  fetchProjectsRequest,
  updateProjectRequest,
} from "../../store/slices/projectSlice";
import { fetchCollaboratorsRequest } from "../../store/slices/collaboratorSlice";
import { fetchCommitsRequest } from "../../store/slices/commitSlice";
import {
  fetchDocumentsRequest,
  createDocumentRequest,
} from "../../store/slices/documentSlice";
import { createVersionRequest } from "../../store/slices/versionSlice";
import { versionApiService } from "../../services/VersionApiService";
import {
  canWriteProject,
  canAdminProject,
} from "../../utils/projectAccess";

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
  const { commits } = useSelector((state) => state.commits);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("workspace");
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [syncSourceBranch, setSyncSourceBranch] = useState("main");
  const [syncTargetBranch, setSyncTargetBranch] = useState("main");
  const [syncMode, setSyncMode] = useState("push");
  const [statusMessage, setStatusMessage] = useState("");

  const project = projects.find((p) => p.id?.toString() === id);

  useEffect(() => {
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!project?.id) return;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      dispatch(fetchProjectsRequest());
      dispatch(fetchCollaboratorsRequest(project.id));
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const t = window.setInterval(refresh, 120000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(t);
    };
  }, [dispatch, project?.id]);

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
      dispatch(
        fetchCommitsRequest({
          projectId: project.id,
          branch: project.currentBranch,
        }),
      );
      dispatch(fetchDocumentsRequest());
      dispatch(fetchCollaboratorsRequest(project.id));
    }
  }, [project, dispatch]);

  if (!project) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400">
        Loading project…
      </div>
    );
  }

  const projectDocuments = documents.filter(
    (d) => d.projectId === project.id && d.branch === project.currentBranch,
  );

  const canWrite = canWriteProject(project, user);
  const canAdmin = canAdminProject(project, user);

  const handleCreateDocument = () => {
    if (!canWrite || !newDocName.trim()) return;
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
  };

  const handleCreateBranch = () => {
    if (!canWrite || !newBranchName.trim()) return;
    dispatch(
      createVersionRequest({
        name: newBranchName.trim(),
        projectId: project.id,
      }),
    );
    setNewBranchName("");
    setShowCreateBranchModal(false);
  };

  const handleBranchChange = (branch) => {
    dispatch(setCurrentBranchForProject({ projectId: project.id, branch }));
    dispatch(fetchCommitsRequest({ projectId: project.id, branch }));
  };

  const handleBranchSync = async () => {
    if (!canWrite) return;
    if (
      !syncSourceBranch ||
      !syncTargetBranch ||
      syncSourceBranch === syncTargetBranch
    ) {
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
      setStatusMessage(
        `Synced ${response.updatedCount} docs (${response.fromBranch} → ${response.toBranch}).`,
      );
      setTimeout(() => setStatusMessage(""), 2200);
      dispatch(
        fetchCommitsRequest({
          projectId: project.id,
          branch: project.currentBranch,
        }),
      );
    } catch (syncError) {
      setStatusMessage(
        syncError?.response?.data?.message || "Branch sync failed.",
      );
      setTimeout(() => setStatusMessage(""), 2200);
    }
  };

  const toggleVisibility = (field, value) => {
    if (!canAdmin) return;
    dispatch(
      updateProjectRequest({
        id: project.id,
        data: { [field]: value },
        quiet: true,
      }),
    );
  };

  const filteredCommits = commits.filter(
    (c) => c.projectId === project.id && c.branch === project.currentBranch,
  );

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">
            {project.name}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage documents and collaboration
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CollaboratorsList projectId={project.id} />
            {project.isPublic ? (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-800">
                Public
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                Private
              </span>
            )}
            {project.isArchived ? (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-800">
                Archived
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0">
          <select
            value={project.currentBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            disabled={!canWrite}
            className="bg-[#111827] border border-gray-700 px-3 py-2 rounded text-sm min-w-[8rem] disabled:opacity-50"
          >
            {project.branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowCreateBranchModal(true)}
            disabled={!canWrite}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 px-3 py-2 rounded text-sm"
          >
            + Branch
          </button>
          <button
            type="button"
            onClick={() => setShowCreateDocModal(true)}
            disabled={!canWrite}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 px-3 py-2 rounded text-sm"
          >
            + Document
          </button>
          <button
            type="button"
            onClick={() => setShowCollaboratorsModal(true)}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
          >
            Collaborators
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">
        {["workspace", "settings"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "workspace" && (
        <>
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-200">
              Branch collaboration (push / pull)
            </h2>
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3">
              <div className="w-full sm:w-auto">
                <p className="text-xs text-gray-400 mb-1">Mode</p>
                <select
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  disabled={!canWrite}
                  className="w-full sm:w-auto bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  <option value="push">Push</option>
                  <option value="pull">Pull</option>
                </select>
              </div>
              <div className="w-full sm:w-auto flex-1 min-w-[8rem]">
                <p className="text-xs text-gray-400 mb-1">Source branch</p>
                <select
                  value={syncSourceBranch}
                  onChange={(e) => setSyncSourceBranch(e.target.value)}
                  disabled={!canWrite}
                  className="w-full bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  {project.branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto flex-1 min-w-[8rem]">
                <p className="text-xs text-gray-400 mb-1">Target branch</p>
                <select
                  value={syncTargetBranch}
                  onChange={(e) => setSyncTargetBranch(e.target.value)}
                  disabled={!canWrite}
                  className="w-full bg-[#0B0F19] border border-gray-700 px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  {project.branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleBranchSync}
                disabled={!canWrite}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 px-4 py-2 rounded text-sm"
              >
                Sync branches
              </button>
              {statusMessage ? (
                <p className="text-xs text-indigo-300 w-full lg:w-auto">
                  {statusMessage}
                </p>
              ) : null}
            </div>
            {!canWrite ? (
              <p className="text-xs text-amber-400/90 mt-2">
                Read-only: you cannot sync or modify branches.
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="bg-red-600/90 text-white p-3 rounded text-sm">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {projectDocuments.map((doc) => (
              <button
                type="button"
                key={doc.id}
                onClick={() => navigate(`/editor?docId=${doc.id}`)}
                className="text-left bg-[#111827] border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-indigo-500 transition"
              >
                <h3 className="font-semibold text-lg break-words">{doc.name}</h3>
                <p className="text-xs text-gray-400 mt-2">Branch: {doc.branch}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
            {projectDocuments.length === 0 && !docLoading ? (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">
                No documents in this branch.{" "}
                {canWrite ? "Create one to get started." : null}
              </div>
            ) : null}
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-200">
              Git history ({project.currentBranch})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCommits.slice(0, 15).map((commit) => (
                <div
                  key={commit.id}
                  className="border border-gray-800 rounded p-3 bg-[#0B0F19]"
                >
                  <p className="text-sm text-gray-100 break-words">
                    {commit.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(commit.createdAt).toLocaleString()} ·{" "}
                    {commit.author}
                  </p>
                </div>
              ))}
              {filteredCommits.length === 0 ? (
                <p className="text-sm text-gray-400">No commits on this branch.</p>
              ) : null}
            </div>
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Project access
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Visibility and archive flags (admin on this project).
            </p>
            <div className="space-y-4 max-w-xl">
              <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-[#0B0F19] border border-gray-700">
                <div>
                  <span className="text-sm font-medium text-white">
                    Public project
                  </span>
                  <p className="text-xs text-gray-500">
                    Visible in listings for your team context.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(project.isPublic)}
                  onChange={(e) =>
                    toggleVisibility("isPublic", e.target.checked)
                  }
                  disabled={!canAdmin}
                  className="w-4 h-4 shrink-0 disabled:opacity-40"
                />
              </label>
              <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-[#0B0F19] border border-gray-700">
                <div>
                  <span className="text-sm font-medium text-white">
                    Archived
                  </span>
                  <p className="text-xs text-gray-500">
                    Freeze routine edits; collaborators still follow permissions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(project.isArchived)}
                  onChange={(e) =>
                    toggleVisibility("isArchived", e.target.checked)
                  }
                  disabled={!canAdmin}
                  className="w-4 h-4 shrink-0 disabled:opacity-40"
                />
              </label>
              {!canAdmin ? (
                <p className="text-xs text-amber-400/90">
                  Only project owners and project admins can change these options.
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Collaborators & invites
            </h2>
            <ProjectCollaboratorsPanel
              projectId={project.id}
              readOnly={!canAdmin}
            />
          </div>
        </div>
      )}

      {showCreateDocModal ? (
        <Modal onClose={() => setShowCreateDocModal(false)}>
          <h2 className="text-lg font-bold mb-4">Create document</h2>
          <input
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Document name"
            className="w-full mb-3 px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded text-sm"
          />
          <textarea
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
            placeholder="Content"
            className="w-full h-32 px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded text-sm"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowCreateDocModal(false)}
              className="flex-1 bg-gray-600 px-3 py-2 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateDocument}
              className="flex-1 bg-green-600 px-3 py-2 rounded text-sm"
            >
              Create
            </button>
          </div>
        </Modal>
      ) : null}

      {showCreateBranchModal ? (
        <Modal onClose={() => setShowCreateBranchModal(false)}>
          <h2 className="text-lg font-bold mb-4">Create branch</h2>
          <input
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/name"
            className="w-full px-3 py-2 bg-[#0B0F19] border border-gray-600 rounded text-sm"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <button
              type="button"
              onClick={() => setShowCreateBranchModal(false)}
              className="flex-1 bg-gray-600 px-3 py-2 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateBranch}
              className="flex-1 bg-indigo-600 px-3 py-2 rounded text-sm"
            >
              Create
            </button>
          </div>
        </Modal>
      ) : null}

      {showCollaboratorsModal ? (
        <CollaboratorsModal
          projectId={project.id}
          onClose={() => setShowCollaboratorsModal(false)}
        />
      ) : null}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] p-4 sm:p-6 rounded-lg w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-sm"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
