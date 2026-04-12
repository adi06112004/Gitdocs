import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class UserApiService {

  static instance;

  static getInstance() {
    if (!UserApiService.instance) {
      UserApiService.instance = new UserApiService();
    }
    return UserApiService.instance;
  }

  getAllUsers() {
    return baseApiService.get(apiRoutes.users.getAll);
  }

  getUserById(id) {
    return baseApiService.get(apiRoutes.users.getById.replace(':id', id));
  }

  createUser(data) {
    return baseApiService.post(apiRoutes.users.create, data);
  }

  updateUser(id, data) {
    return baseApiService.put(apiRoutes.users.update.replace(':id', id), data);
  }

  deleteUser(id) {
    return baseApiService.delete(apiRoutes.users.delete.replace(':id', id));
  }

  patchMe(data) {
    return baseApiService.patch(apiRoutes.users.me, data);
  }

  patchPassword(data) {
    return baseApiService.patch(apiRoutes.users.mePassword, data);
  }

  patchPreferences(notifications) {
    return baseApiService.patch(apiRoutes.users.mePreferences, {
      notifications,
    });
  }
}

export const userApiService = UserApiService.getInstance();