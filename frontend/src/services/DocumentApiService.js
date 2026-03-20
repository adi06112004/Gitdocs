import { apiRoutes } from "@/routes/ApiRoutes";
import { baseApiService } from "./BaseApiService";

class DocumentApiService {

  static instance;

  static getInstance() {
    if (!DocumentApiService.instance) {
      DocumentApiService.instance = new DocumentApiService();
    }
    return DocumentApiService.instance;
  }

  getAllDocuments() {
    return baseApiService.get(apiRoutes.documents.getAll);
  }

  getDocumentById(id) {
    return baseApiService.get(apiRoutes.documents.getById.replace(':id', id));
  }

  createDocument(data) {
    return baseApiService.post(apiRoutes.documents.create, data);
  }

  updateDocument(id, data) {
    return baseApiService.put(apiRoutes.documents.update.replace(':id', id), data);
  }

  deleteDocument(id) {
    return baseApiService.delete(apiRoutes.documents.delete.replace(':id', id));
  }
}

export const documentApiService = DocumentApiService.getInstance();