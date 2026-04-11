import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginRequest, signupRequest } from "../../store/slices/authSlice";
import { WebRoutes } from "../../routes/WebRoutes";
import "./SignIn.css";

const SignIn = () => {
  const [tab, setTab] = useState("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(WebRoutes.DASHBOARD());
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === "signin") {
      dispatch(
        loginRequest({ email: formData.email, password: formData.password }),
      );
    } else {
      dispatch(signupRequest(formData));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="breadcrumb">AUTH &gt; {tab.toUpperCase()}</div>

      <div className="auth-card">
        <div className="auth-header-content">
          <h2>Commit your thoughts.</h2>
          <p>Sign in to manage your versioned documentation.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-tabs">
            <button
              type="button"
              className={tab === "signin" ? "active" : ""}
              onClick={() => setTab("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={tab === "signup" ? "active" : ""}
              onClick={() => setTab("signup")}
            >
              Create Account
            </button>
          </div>

          {tab === "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="auth-input"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="auth-input"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading
              ? "Loading..."
              : tab === "signin"
                ? "Sign In →"
                : "Create Account →"}
          </button>
        </form>

        <div className="divider">OR CONTINUE WITH</div>

        <div className="social-buttons">
          <button className="social-btn">GitHub</button>
          <button className="social-btn">Google</button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
