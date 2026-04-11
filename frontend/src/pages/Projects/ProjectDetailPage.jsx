import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Users } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import CollaboratorsModal from "../../components/CollaboratorsModal";

import {
  setCurrentProject,
  setCurrentBranchForProject,
  fetchProjectsRequest,
} from "../../store/slices/projectSlice";
import { createDocumentRequest } from "../../store/slices/documentSlice";
import { createVersionRequest } from "../../store/slices/versionSlice";
import { fetchCollaboratorsRequest } from "../../store/slices/collaboratorSlice";

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

  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newBranchName, setNewBranchName] = useState("");

  const project = projects.find((p) => p.id?.toString() === id);

  useEffect(() => {
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
      // Fetch collaborators for this project
      dispatch(fetchCollaboratorsRequest(project.id));
    }
  }, [project, dispatch]);

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
  };

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
            {/* Collaborators Button */}
            <button
              onClick={() => setShowCollaboratorsModal(true)}
              className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm flex items-center gap-2"
            >
              <Users size={16} />
              Collaborators
            </button>

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

      {/* COLLABORATORS MODAL */}
      {showCollaboratorsModal && (
        <CollaboratorsModal
          projectId={project.id}
          onClose={() => setShowCollaboratorsModal(false)}
        />
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
