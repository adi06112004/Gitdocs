import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class CollaboratorApiService {

  static instance;

  static getInstance() {
    if (!CollaboratorApiService.instance) {
      CollaboratorApiService.instance = new CollaboratorApiService();
    }
    return CollaboratorApiService.instance;
  }

  // Get all collaborators for a project
  getProjectCollaborators(projectId) {
    return baseApiService.get(apiRoutes.collaborators.getByProject.replace(':projectId', projectId));
  }

  // Invite a user to collaborate on a project (email + permission: read|write|admin)
  inviteCollaborator(projectId, data) {
    const body = {
      email: data.email,
      userId: data.userId,
      permission: data.permission || data.role || "read",
    };
    return baseApiService.post(
      apiRoutes.collaborators.invite.replace(":projectId", projectId),
      body,
    );
  }

  // Remove a collaborator from a project
  removeCollaborator(projectId, userId) {
    return baseApiService.delete(apiRoutes.collaborators.remove.replace(':projectId', projectId).replace(':userId', userId));
  }

  // Update collaborator role/permissions
  updateCollaborator(projectId, userId, data) {
    const body = {
      permission: data.permission || data.role,
    };
    return baseApiService.put(
      apiRoutes.collaborators.update
        .replace(":projectId", projectId)
        .replace(":userId", userId),
      body,
    );
  }
}

export const collaboratorApiService = CollaboratorApiService.getInstance();
