import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, Shield, History } from "lucide-react";

import {
  fetchCollaboratorsRequest,
  inviteCollaboratorRequest,
  removeCollaboratorRequest,
  updateCollaboratorRequest,
} from "../store/slices/collaboratorSlice";

export function ProjectCollaboratorsPanel({
  projectId,
  readOnly = false,
}) {
  const dispatch = useDispatch();
  const collaborators = useSelector(
    (state) => state.collaborators.collaborators[projectId] || [],
  );
  const inviteHistory = useSelector(
    (state) => state.collaborators.inviteHistory[projectId] || [],
  );
  const inviteLoading = useSelector(
    (state) => state.collaborators.inviteLoading,
  );
  const loading = useSelector((state) => state.collaborators.loading);

  useEffect(() => {
    dispatch(fetchCollaboratorsRequest(projectId));
  }, [dispatch, projectId]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("read");

  const handleInvite = (e) => {
    e.preventDefault();
    if (readOnly || !inviteEmail.trim()) return;
    dispatch(
      inviteCollaboratorRequest({
        projectId,
        data: {
          email: inviteEmail.trim(),
          permission: inviteRole,
        },
      }),
    );
    setInviteEmail("");
    setInviteRole("read");
  };

  const handleRemove = (userId) => {
    if (readOnly) return;
    if (window.confirm("Remove this collaborator from the project?")) {
      dispatch(removeCollaboratorRequest({ projectId, userId }));
    }
  };

  const handleUpdateRole = (userId, newRole) => {
    if (readOnly) return;
    dispatch(
      updateCollaboratorRequest({
        projectId,
        userId,
        data: { permission: newRole },
      }),
    );
  };

  const roleColors = {
    admin: "bg-red-600 text-white",
    write: "bg-blue-600 text-white",
    read: "bg-gray-600 text-white",
  };

  const perm = (c) => c.permission || c.role || "read";

  return (
    <div className="space-y-6">
      {!readOnly ? (
        <div className="p-4 bg-[#0B0F19] rounded-lg border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Invite collaborator
          </h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 min-w-0 px-3 py-2 bg-[#111827] border border-gray-700 rounded text-sm text-white placeholder-gray-500"
              />
              <div className="flex gap-2 shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 bg-[#111827] border border-gray-700 rounded text-sm text-white min-w-[6rem]"
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white rounded text-sm font-medium flex items-center gap-2 transition"
                >
                  <Plus size={16} className="shrink-0" />
                  <span className="hidden sm:inline">
                    {inviteLoading ? "…" : "Invite"}
                  </span>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              The person must already have a GitDocs account.
            </p>
          </form>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Members</h3>
        {collaborators?.length > 0 ? (
          <ul className="space-y-2">
            {collaborators.map((collaborator) => (
              <li
                key={collaborator.userId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-[#0B0F19] rounded-lg border border-gray-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">
                    {collaborator.username || collaborator.name || "Member"}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {collaborator.email || collaborator.userId}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {readOnly ? (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium capitalize ${roleColors[perm(collaborator)] || roleColors.read}`}
                    >
                      {perm(collaborator)}
                    </span>
                  ) : (
                    <select
                      value={perm(collaborator)}
                      onChange={(e) =>
                        handleUpdateRole(
                          collaborator.userId,
                          e.target.value,
                        )
                      }
                      disabled={loading}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${roleColors[perm(collaborator)] || roleColors.read}`}
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(collaborator.userId)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded transition disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Shield size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No collaborators yet</p>
          </div>
        )}
      </div>

      {inviteHistory?.length > 0 ? (
        <div className="p-4 bg-[#0B0F19] rounded-lg border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
            <History size={14} />
            Invite history
          </h4>
          <ul className="text-xs text-gray-400 space-y-2 max-h-40 overflow-y-auto">
            {inviteHistory
              .slice()
              .reverse()
              .map((entry, idx) => (
                <li
                  key={`${entry.email}-${entry.createdAt}-${idx}`}
                  className="flex flex-wrap justify-between gap-1 border-b border-gray-800/80 pb-2 last:border-0"
                >
                  <span className="text-gray-300">{entry.email}</span>
                  <span className="capitalize">{entry.permission}</span>
                  <span className="text-gray-500 w-full sm:w-auto">
                    {entry.createdAt
                      ? new Date(entry.createdAt).toLocaleString()
                      : ""}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="p-4 bg-[#0B0F19] rounded-lg border border-gray-800">
        <h4 className="text-xs font-semibold text-gray-300 mb-2">
          Permission levels
        </h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            <span className="font-medium text-gray-300">Read:</span> View
            project and documents.
          </p>
          <p>
            <span className="font-medium text-gray-300">Write:</span> Edit
            documents and branches.
          </p>
          <p>
            <span className="font-medium text-gray-300">Admin:</span> Manage
            collaborators and visibility.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CollaboratorsModal({ projectId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] p-4 sm:p-6 rounded-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-xl font-bold text-white pr-10 mb-4">
          Project collaborators
        </h2>
        <ProjectCollaboratorsPanel projectId={projectId} readOnly={false} />
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
