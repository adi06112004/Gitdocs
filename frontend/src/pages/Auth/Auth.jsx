import "./Auth.css";
import { Link } from "react-router-dom";
import SignIn from "./SignIn";
import { WebRoutes } from "../../routes/WebRoutes";

const Auth = () => {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <div className="auth-logo">
          <div className="logo-box"></div>
          <span>GitDoc</span>
        </div>

        <nav className="auth-nav">
          <Link to={WebRoutes.DOCS()}>Documentation</Link>
          <Link to={`${WebRoutes.DOCS()}#api`}>API</Link>
          <a href="#">Changelog</a>
          <div className="status-pill">Systems Operational</div>
        </nav>
      </header>

      <main className="auth-main">
        <SignIn />
      </main>

      <footer className="auth-footer">
        <a href="#">Privacy Policy</a>
        <span>•</span>
        <a href="#">Terms of Service</a>
        <span>•</span>
        <a href="#">Help Center</a>
      </footer>
    </div>
  );
};

export default Auth;
