import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class ProjectApiService {

  static instance;

  static getInstance() {
    if (!ProjectApiService.instance) {
      ProjectApiService.instance = new ProjectApiService();
    }
    return ProjectApiService.instance;
  }

  getAllProjects() {
    return baseApiService.get(apiRoutes.projects.getAll);
  }

  getProjectById(id) {
    return baseApiService.get(apiRoutes.projects.getById.replace(':id', id));
  }

  createProject(data) {
    return baseApiService.post(apiRoutes.projects.create, data);
  }

  updateProject(id, data) {
    return baseApiService.put(apiRoutes.projects.update.replace(':id', id), data);
  }

  deleteProject(id) {
    return baseApiService.delete(apiRoutes.projects.delete.replace(':id', id));
  }

  rollbackProjectActivity(commitId, activityMeta = {}) {
    return baseApiService.post(
      apiRoutes.projects.rollback.replace(':commitId', commitId),
      { activityMeta },
    );
  }

  getCollaborators(projectId) {
    return baseApiService.get(
      apiRoutes.projects.collaborators.replace(':id', projectId),
    );
  }

  upsertCollaborator(projectId, data) {
    return baseApiService.post(
      apiRoutes.projects.collaborators.replace(':id', projectId),
      data,
    );
  }

  removeCollaborator(projectId, userId) {
    return baseApiService.delete(
      apiRoutes.projects.collaboratorByUser
        .replace(':id', projectId)
        .replace(':userId', userId),
    );
  }
}

export const projectApiService = ProjectApiService.getInstance();