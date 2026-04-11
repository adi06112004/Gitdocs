import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, Shield } from "lucide-react";

import {
  inviteCollaboratorRequest,
  removeCollaboratorRequest,
  updateCollaboratorRequest,
} from "../../store/slices/collaboratorSlice";
import {
  addProjectCollaborator,
  removeProjectCollaborator,
} from "../../store/slices/projectSlice";

export default function CollaboratorsModal({ projectId, onClose }) {
  const dispatch = useDispatch();
  const collaborators = useSelector(
    (state) => state.collaborators.collaborators[projectId] || [],
  );
  const inviteLoading = useSelector(
    (state) => state.collaborators.inviteLoading,
  );
  const loading = useSelector((state) => state.collaborators.loading);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("read");
  const [selectedRole, setSelectedRole] = useState({});

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      dispatch(
        inviteCollaboratorRequest({
          projectId,
          data: {
            email: inviteEmail.trim(),
            role: inviteRole,
          },
        }),
      );
      setInviteEmail("");
      setInviteRole("read");
    }
  };

  const handleRemove = (userId) => {
    if (confirm("Are you sure you want to remove this collaborator?")) {
      dispatch(
        removeCollaboratorRequest({
          projectId,
          userId,
        }),
      );
    }
  };

  const handleUpdateRole = (userId, newRole) => {
    dispatch(
      updateCollaboratorRequest({
        projectId,
        userId,
        data: { role: newRole },
      }),
    );
  };

  const roleColors = {
    admin: "bg-red-600 text-white",
    write: "bg-blue-600 text-white",
    read: "bg-gray-600 text-white",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111827] p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Project Collaborators
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* INVITE SECTION */}
        <div className="mb-6 p-4 bg-[#0B0F19] rounded-lg border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Invite New Collaborator
          </h3>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded text-sm text-white placeholder-gray-500"
              />

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 bg-[#111827] border border-gray-700 rounded text-sm text-white"
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
                <Plus size={16} />
                {inviteLoading ? "Inviting..." : "Invite"}
              </button>
            </div>
          </form>
        </div>

        {/* COLLABORATORS LIST */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Members</h3>
          {collaborators && collaborators.length > 0 ? (
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 bg-[#0B0F19] rounded-lg border border-gray-800 hover:border-gray-700 transition"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {collaborator.username || "Unknown"}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {collaborator.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <select
                        value={collaborator.role || "read"}
                        onChange={(e) =>
                          handleUpdateRole(collaborator.userId, e.target.value)
                        }
                        disabled={loading}
                        className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          roleColors[collaborator.role || "read"]
                        }`}
                      >
                        <option value="read">Read</option>
                        <option value="write">Write</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(collaborator.userId)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded transition disabled:opacity-50"
                      title="Remove collaborator"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Shield size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No collaborators yet</p>
              <p className="text-xs text-gray-500">
                Invite someone to start collaborating
              </p>
            </div>
          )}
        </div>

        {/* ROLE DESCRIPTIONS */}
        <div className="mt-6 p-4 bg-[#0B0F19] rounded-lg border border-gray-800">
          <h4 className="text-xs font-semibold text-gray-300 mb-2">
            Permission Levels
          </h4>
          <div className="text-xs text-gray-400 space-y-1">
            <p>
              <span className="font-medium text-gray-300">Read:</span> View
              projects and documents
            </p>
            <p>
              <span className="font-medium text-gray-300">Write:</span> Create
              and edit documents
            </p>
            <p>
              <span className="font-medium text-gray-300">Admin:</span> Full
              access including inviting collaborators
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-6">
          <button
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
