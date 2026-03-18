import { fetchDocumentsRequest } from "../slice/documentSlice";

export const getDocuments = () => {
  return fetchDocumentsRequest();
};