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

  // Invite a user to collaborate on a project
  inviteCollaborator(projectId, data) {
    return baseApiService.post(apiRoutes.collaborators.invite.replace(':projectId', projectId), data);
  }

  // Remove a collaborator from a project
  removeCollaborator(projectId, userId) {
    return baseApiService.delete(apiRoutes.collaborators.remove.replace(':projectId', projectId).replace(':userId', userId));
  }

  // Update collaborator role/permissions
  updateCollaborator(projectId, userId, data) {
    return baseApiService.put(apiRoutes.collaborators.update.replace(':projectId', projectId).replace(':userId', userId), data);
  }
}

export const collaboratorApiService = CollaboratorApiService.getInstance();
