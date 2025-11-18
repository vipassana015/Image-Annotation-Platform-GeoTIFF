import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      // Store user data in localStorage
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("username", username);

      alert("Login successful! User ID: " + res.data.user_id);
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
