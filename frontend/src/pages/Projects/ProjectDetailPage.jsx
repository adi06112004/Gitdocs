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
import { canWriteProject, canAdminProject } from "../../utils/projectAccess";

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
      const activeBranch =
        project.currentBranch &&
        project.branches.includes(project.currentBranch)
          ? project.currentBranch
          : "main";

      if (project.currentBranch !== activeBranch) {
        dispatch(
          setCurrentBranchForProject({
            projectId: project.id,
            branch: activeBranch,
          }),
        );
      }

      dispatch(setCurrentProject(project));
      dispatch(
        fetchCommitsRequest({
          projectId: project.id,
          branch: activeBranch,
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

  const currentBranch =
    project.currentBranch && project.branches.includes(project.currentBranch)
      ? project.currentBranch
      : "main";

  const projectDocuments = documents.filter(
    (d) => d.projectId === project.id && d.branch === currentBranch,
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
        branch: currentBranch,
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
          branch: currentBranch,
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
    (c) => c.projectId === project.id && c.branch === currentBranch,
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
            value={currentBranch}
            onChange={(e) => handleBranchChange(e.target.value)}
            disabled={!canWrite}
            className="bg-[#09090b] border border-white/10 px-3 py-2 rounded-lg text-sm min-w-[8rem] disabled:opacity-50 hover:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-zinc-200"
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
            className="bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm"
          >
            + Branch
          </button>
          <button
            type="button"
            onClick={() => setShowCreateDocModal(true)}
            disabled={!canWrite}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300 border border-emerald-500/50"
          >
            + Document
          </button>
          <button
            type="button"
            onClick={() => setShowCollaboratorsModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/25 active:scale-95 transition-all duration-300 border border-indigo-500/50"
          >
            Collaborators
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {["workspace", "settings"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${
              activeTab === tab
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "workspace" && (
        <>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h2 className="text-sm font-semibold mb-4 text-zinc-100">
              Branch collaboration (push / pull)
            </h2>
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3">
              <div className="w-full sm:w-auto">
                <p className="text-xs text-zinc-500 mb-1.5 font-medium">Mode</p>
                <select
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  disabled={!canWrite}
                  className="w-full sm:w-auto bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm disabled:opacity-50 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-zinc-300"
                >
                  <option value="push" className="bg-[#09090b]">Push</option>
                  <option value="pull" className="bg-[#09090b]">Pull</option>
                </select>
              </div>
              <div className="w-full sm:w-auto flex-1 min-w-[8rem]">
                <p className="text-xs text-zinc-500 mb-1.5 font-medium">Source branch</p>
                <select
                  value={syncSourceBranch}
                  onChange={(e) => setSyncSourceBranch(e.target.value)}
                  disabled={!canWrite}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm disabled:opacity-50 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-zinc-300"
                >
                  {project.branches.map((b) => (
                    <option key={b} value={b} className="bg-[#09090b]">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-auto flex-1 min-w-[8rem]">
                <p className="text-xs text-zinc-500 mb-1.5 font-medium">Target branch</p>
                <select
                  value={syncTargetBranch}
                  onChange={(e) => setSyncTargetBranch(e.target.value)}
                  disabled={!canWrite}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm disabled:opacity-50 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-zinc-300"
                >
                  {project.branches.map((b) => (
                    <option key={b} value={b} className="bg-[#09090b]">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleBranchSync}
                disabled={!canWrite}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 border border-indigo-500/50 active:scale-95 transition-all duration-300"
              >
                Sync branches
              </button>
              {statusMessage ? (
                <p className="text-xs text-indigo-300 w-full lg:w-auto font-medium">
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

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-sm font-semibold text-zinc-100">
                Documents ({currentBranch})
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {projectDocuments.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => navigate(`/editor?docId=${doc.id}`)}
                  className="w-full text-left px-5 py-4 hover:bg-white/[0.04] transition-colors duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-[3px] flex-shrink-0 shadow-sm shadow-indigo-500/50 group-hover:scale-110 transition-transform"></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Updated {new Date(doc.updatedAt).toLocaleDateString()}{" "}
                        by {doc.lastEditedBy || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    {doc.branch}
                  </div>
                </button>
              ))}
              {projectDocuments.length === 0 && !docLoading ? (
                <div className="px-5 py-10 text-center text-zinc-500 text-sm">
                  No documents in this branch.{" "}
                  {canWrite ? "Create one to get started." : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            <h2 className="text-sm font-semibold mb-4 text-zinc-100 ml-2">
              Git history ({currentBranch})
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pl-2">
              {filteredCommits.slice(0, 15).map((commit) => (
                <div
                  key={commit.id}
                  className="border border-white/5 rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <p className="text-sm font-medium text-zinc-200 break-words">
                    {commit.message}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 flex items-center justify-between">
                    <span>{new Date(commit.createdAt).toLocaleString()}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-400">{commit.author}</span>
                  </p>
                </div>
              ))}
              {filteredCommits.length === 0 ? (
                <p className="text-sm text-zinc-500 ml-2">
                  No commits on this branch.
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">
              Project access
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Visibility and archive flags (admin on this project).
            </p>
            <div className="space-y-4 max-w-xl">
              <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                <div>
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-300">
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
                  className="w-4 h-4 shrink-0 disabled:opacity-40 accent-indigo-500"
                />
              </label>
              <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/50 transition-colors cursor-pointer group">
                <div>
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-amber-300">
                    Archived
                  </span>
                  <p className="text-xs text-gray-500">
                    Freeze routine edits; collaborators still follow
                    permissions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(project.isArchived)}
                  onChange={(e) =>
                    toggleVisibility("isArchived", e.target.checked)
                  }
                  disabled={!canAdmin}
                  className="w-4 h-4 shrink-0 disabled:opacity-40 accent-amber-500"
                />
              </label>
              {!canAdmin ? (
                <p className="text-xs text-amber-500/90 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg font-medium">
                  Only project owners and project admins can change these
                  options.
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-100 mb-5">
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
          <h2 className="text-lg font-bold mb-4 text-zinc-100 relative z-10">Create document</h2>
          <input
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Document name"
            className="w-full mb-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors relative z-10"
          />
          <textarea
            value={newDocContent}
            onChange={(e) => setNewDocContent(e.target.value)}
            placeholder="Content"
            className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors relative z-10 resize-none"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 relative z-10">
            <button
              type="button"
              onClick={() => setShowCreateDocModal(false)}
              className="flex-1 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateDocument}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-white border border-emerald-500/50"
            >
              Create
            </button>
          </div>
        </Modal>
      ) : null}

      {showCreateBranchModal ? (
        <Modal onClose={() => setShowCreateBranchModal(false)}>
          <h2 className="text-lg font-bold mb-4 text-zinc-100 relative z-10">Create branch</h2>
          <input
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/name"
            className="w-full px-3 py-2 mb-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors relative z-10"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5 relative z-10">
            <button
              type="button"
              onClick={() => setShowCreateBranchModal(false)}
              className="flex-1 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateBranch}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/25 active:scale-95 transition-all text-white border border-indigo-500/50"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-[#09090b] border border-white/10 shadow-2xl p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative custom-scrollbar">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 pointer-events-none" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-sm p-1 rounded hover:bg-white/5 transition-colors z-20 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
