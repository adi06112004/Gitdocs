import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class VersionApiService {

  static instance;

  static getInstance() {
    if (!VersionApiService.instance) {
      VersionApiService.instance = new VersionApiService();
    }
    return VersionApiService.instance;
  }

  getAllVersions() {
    return baseApiService.get(apiRoutes.versions.getAll);
  }

  getVersionById(id) {
    return baseApiService.get(apiRoutes.versions.getById.replace(':id', id));
  }

  createVersion(data) {
    return baseApiService.post(apiRoutes.versions.create, data);
  }

  updateVersion(id, data) {
    return baseApiService.put(apiRoutes.versions.update.replace(':id', id), data);
  }

  deleteVersion(id) {
    return baseApiService.delete(apiRoutes.versions.delete.replace(':id', id));
  }

  syncBranch(data) {
    return baseApiService.post(apiRoutes.versions.sync, data);
  }
}

export const versionApiService = VersionApiService.getInstance();