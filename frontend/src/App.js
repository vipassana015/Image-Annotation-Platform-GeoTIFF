import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import NewProjectPage from "./pages/NewProjectPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
      </Routes>
    </Router>
  );
}

export default App;
