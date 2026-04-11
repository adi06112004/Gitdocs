import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class CommitApiService {

  static instance;

  static getInstance() {
    if (!CommitApiService.instance) {
      CommitApiService.instance = new CommitApiService();
    }
    return CommitApiService.instance;
  }

  getAllCommits(params = {}) {
    return baseApiService.get(apiRoutes.commits.getAll, params);
  }

  getCommitById(id) {
    return baseApiService.get(apiRoutes.commits.getById.replace(':id', id));
  }

  createCommit(data) {
    return baseApiService.post(apiRoutes.commits.create, data);
  }

  updateCommit(id, data) {
    return baseApiService.put(apiRoutes.commits.update.replace(':id', id), data);
  }

  deleteCommit(id) {
    return baseApiService.delete(apiRoutes.commits.delete.replace(':id', id));
  }
}

export const commitApiService = CommitApiService.getInstance();