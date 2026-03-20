import "./Auth.css";

const CreateAccount = () => {
  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button>Signup</button>
    </div>
  );
};

export default CreateAccount;
