import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/signup/", {
        username,
        password,
      });
      alert("Signup successful! Now login.");
    } catch (err) {
  if (err.response) {
    alert("Error: " + JSON.stringify(err.response.data));
  } else if (err.request) {
    alert("No response from server. Check if Django is running.");
  } else {
    alert("Error: " + err.message);
  }
}

  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Signup</h2>
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
      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
