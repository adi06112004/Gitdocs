import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import { WebRoutes } from "./routes/WebRoutes";
import Auth from "./pages/Auth/Auth";
import Navbar from "./components/Navbar";
import SignIn from "./pages/Auth/SignIn";
import CreateAccount from "./pages/Auth/CreateAccount";
import Dashboard from "./pages/Dashboard/Dashboard";
import EditorPage from "./pages/Editor/EditorPage";
import Sidebar from "./components/Sidebar";
import Documents from "./pages/Documents/Documents";
import Projects from "./pages/Projects/Projects";
import ProjectDetailPage from "./pages/Projects/ProjectDetailPage";
import Versions from "./pages/Versions/Versions";
import Activity from "./pages/Activity/Activity";
import Settings from "./pages/Settings/Settings";
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
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Dashboard />
              </div>
            </div>
          }
        />
        <Route
          path={WebRoutes.DOCUMENTS()}
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Documents />
              </div>
            </div>
          }
        />
        <Route
          path={WebRoutes.PROJECTS()}
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Projects />
              </div>
            </div>
          }
        />
        <Route
          path={WebRoutes.VERSIONS()}
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Versions />
              </div>
            </div>
          }
        />
        <Route
          path={WebRoutes.ACTIVITY()}
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Activity />
              </div>
            </div>
          }
        />
        <Route
          path={WebRoutes.SETTINGS()}
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Settings />
              </div>
            </div>
          }
        />
        <Route
          path="/project/:id"
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <ProjectDetailPage />
              </div>
            </div>
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
