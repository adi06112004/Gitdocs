import { useSelector } from "react-redux";
import { Users, User } from "lucide-react";

export default function CollaboratorsList({ projectId }) {
  const collaborators = useSelector(
    (state) => state.collaborators.collaborators[projectId] || [],
  );

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  // Show max 3 collaborators, rest in +X badge
  const displayedCollaborators = collaborators.slice(0, 3);
  const remaining = collaborators.length - 3;

  return (
    <div className="flex items-center gap-2">
      <Users size={14} className="text-gray-400" />
      <div className="flex items-center gap-1">
        {displayedCollaborators.map((collab) => (
          <div
            key={collab.id}
            className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition"
            title={`${collab.username || collab.email} (${collab.role})`}
          >
            {(collab.username || collab.email)[0].toUpperCase()}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition"
            title={`+${remaining} more`}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
