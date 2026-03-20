import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class AuthApiService {

  static instance;

  static getInstance() {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }

  login(data) {
    return baseApiService.post(apiRoutes.auth.login, data);
  }

  logout() {
    return baseApiService.post(apiRoutes.auth.logout);
  }

  fetchMe() {
    return baseApiService.get(apiRoutes.auth.fetchMe);
  }

  forgotPassword(data) {
    return baseApiService.post(apiRoutes.auth.forgotPassword, data);
  }

  resendForgotPassword(data) {
    return baseApiService.post(apiRoutes.auth.forgotPasswordResend, data);
  }

  resetPassword(data) {
    return baseApiService.post(apiRoutes.auth.resetPassword, data);
  }
}

export const authApiService = AuthApiService.getInstance();