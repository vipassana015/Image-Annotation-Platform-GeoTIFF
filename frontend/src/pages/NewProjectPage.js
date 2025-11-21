// frontend/src/pages/NewProjectPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NewProjectPage.css";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [collabInput, setCollabInput] = useState(""); // current text in collaborator input
  const [collaborators, setCollaborators] = useState([]); // array of { email, role }
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Token ${token}`;
    return headers;
  };

  // Add collaborator from input (press Enter or click add)
  const addCollaborator = () => {
    const val = collabInput.trim();
    if (!val) return;
    // avoid duplicates
    if (collaborators.some(c => c.email.toLowerCase() === val.toLowerCase())) {
      setCollabInput("");
      return;
    }
    // Default role: editor (you can change later per-collab in settings)
    setCollaborators(prev => [...prev, { email: val, role: "editor" }]);
    setCollabInput("");
  };

  const removeCollaborator = (email) => {
    setCollaborators(prev => prev.filter(c => c.email !== email));
  };

  const handleCollabKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCollaborator();
    } else if (e.key === "," ) {
      // allow comma-separated entry
      e.preventDefault();
      addCollaborator();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim() || null,
        visibility,
        collaborators, // array of { email, role }
      };

      const res = await axios.post(`${API}/api/projects/`, payload, { headers: getHeaders() });
      const project = res.data;
      // navigate to the project's page (adjust route if different)
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error("Create project error", err.response || err);
      const msg = err.response?.data || err.message || "Unknown error";
      // Try to display helpful message
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newproject-page">
      <div className="newproject-card">
        <h1 className="np-title">New Project</h1>
        <p className="np-sub">Create a new annotation project — draw bounding boxes or polygons and label them.</p>

        <form className="np-form" onSubmit={submit}>

          <label className="np-label">
            Project name <span className="required">*</span>
            <input
              className="np-input"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="np-label">
            Description <span className="np-optional">(optional)</span>
            <textarea
              className="np-textarea"
              placeholder="Short description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </label>

          <label className="np-label">
            Collaborators
            <div className="np-collab-row">
              <input
                className="np-input collab-input"
                placeholder="Add by email or username and press Enter"
                value={collabInput}
                onChange={(e) => setCollabInput(e.target.value)}
                onKeyDown={handleCollabKeyDown}
              />
              <button type="button" className="np-small-btn" onClick={addCollaborator}>Add</button>
            </div>

            <div className="np-collab-chips">
              {collaborators.map((c) => (
                <div className="np-chip" key={c.email}>
                  <span className="np-chip-text">{c.email}</span>
                  <button type="button" className="np-chip-x" onClick={() => removeCollaborator(c.email)}>✕</button>
                </div>
              ))}
            </div>
          </label>

          <label className="np-label">
            Visibility
            <select className="np-select" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="private">Private (only you & collaborators)</option>
              <option value="team">Team (organization)</option>
              <option value="public">Public (anyone)</option>
            </select>
          </label>

          {errorMsg && <div className="np-error">{errorMsg}</div>}

          <div className="np-actions">
            <button type="button" className="np-btn-cancel" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
            <button type="submit" className="np-btn-create" disabled={loading}>
              {loading ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
