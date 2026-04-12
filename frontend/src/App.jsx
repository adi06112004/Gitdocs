import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import { WebRoutes } from "./routes/WebRoutes";
import Auth from "./pages/Auth/Auth";
import Navbar from "./components/Navbar";
import AppLayout from "./components/AppLayout";
import SignIn from "./pages/Auth/SignIn";
import CreateAccount from "./pages/Auth/CreateAccount";
import Dashboard from "./pages/Dashboard/Dashboard";
import EditorPage from "./pages/Editor/EditorPage";
import Documents from "./pages/Documents/Documents";
import Projects from "./pages/Projects/Projects";
import ProjectDetailPage from "./pages/Projects/ProjectDetailPage";
import Versions from "./pages/Versions/Versions";
import Activity from "./pages/Activity/Activity";
import Settings from "./pages/Settings/Settings";
import DocumentationPage from "./pages/Documentation/DocumentationPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path={WebRoutes.HOME()} element={<Home />} />
        <Route path={WebRoutes.AUTH()} element={<Auth />} />
        <Route path={WebRoutes.LOGIN()} element={<SignIn />} />
        <Route path={WebRoutes.SIGNIN()} element={<SignIn />} />
        <Route path={WebRoutes.CREATEACCOUNT()} element={<CreateAccount />} />
        <Route
          path={WebRoutes.DASHBOARD()}
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.DOCUMENTS()}
          element={
            <AppLayout>
              <Documents />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.PROJECTS()}
          element={
            <AppLayout>
              <Projects />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.VERSIONS()}
          element={
            <AppLayout>
              <Versions />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.ACTIVITY()}
          element={
            <AppLayout>
              <Activity />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.SETTINGS()}
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route
          path={WebRoutes.DOCS()}
          element={
            <AppLayout>
              <DocumentationPage />
            </AppLayout>
          }
        />
        <Route
          path="/project/:id"
          element={
            <AppLayout>
              <ProjectDetailPage />
            </AppLayout>
          }
        />
        <Route path={WebRoutes.EDITOR()} element={<EditorPage />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
