import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../api/api.js";
import "./Form.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!email.trim() || !password) {
      setMessage(
        "Please enter email and password"
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          email: email,
          password: password
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      navigate("/dashboard");

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">

      <div className="form-card">

        <div className="auth-brand">
          <h2>
            SplitEase
          </h2>

          <span>
            Group Expense Splitter
          </span>
        </div>

        <h1>
          Welcome Back
        </h1>

        <p>
          Login to manage your groups,
          expenses and settlements.
        </p>

        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;