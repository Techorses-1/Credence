import { useState } from "react";
import axios from "axios";
import "./ClientLogin.scss";

const ClientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client/login`,
        { email, password },
        { withCredentials: true }
      );
      window.location.href = "/client/dashboard";
    } catch (err) {
      if (err.response?.data?.enrollRequired) {
        setError("Account not found. Please enroll first.");
      } else {
        setError("Invalid email or password");
      }
    }
  };

  return (
    <div className="client-login">
      <div className="client-login__card">
        <h2>Client Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>

        <p className="link">
          Don’t have an account?{" "}
          <a href="/client/enroll">Enroll here</a>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
