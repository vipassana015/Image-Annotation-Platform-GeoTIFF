// frontend/src/pages/NewProjectPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NewProjectPage.css";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [collaborators, setCollaborators] = useState([]); 
  const [collabInput, setCollabInput] = useState(""); 
  const [visibility, setVisibility] = useState("private");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  const getHeaders = () => {
  const token = localStorage.getItem("access_token"); // ✅ correct key
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // ✅ correct scheme
  }

  return headers;
};


  // Add collaborator from input (press Enter or click add)
  const handleAddCollaborator = () => {
  const value = collabInput.trim();

  if (!value) return;

  // Prevent duplicates
  if (collaborators.includes(value)) return;

  setCollaborators([...collaborators, value]);
  setCollabInput("");
};

  const handleRemoveCollaborator = (value) => {
  setCollaborators(collaborators.filter((c) => c !== value));
};;

  const handleCollabKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCollaborator();
    } else if (e.key === "," ) {
      // allow comma-separated entry
      e.preventDefault();
      handleAddCollaborator();
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
      description: desc.trim() || "",
      visibility,
    };

    // 1️⃣ CREATE PROJECT
    const res = await axios.post(
      `${API}/api/projects/`,
      payload,
      { headers: getHeaders() }
    );

    const projectId = res.data.id;

    // 2️⃣ ADD COLLABORATORS (NEW)
    for (let collab of collaborators) {
      try {
        await axios.post(
          `${API}/api/projects/${projectId}/members/add/`,
          {
            identifier: collab,
            role: "annotator",
          },
          { headers: getHeaders() }
        );
      } catch (err) {
        console.error(`Failed to add ${collab}`, err);
      }
    }

    // 3️⃣ NAVIGATE
    navigate(`/projects/${projectId}/`);

  } catch (error) {
    console.error("Create project failed:", error);
    setErrorMsg("Failed to create project. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="newproject-page">
      <div className="newproject-card">
        <h1 className="np-title">New Project</h1>
        <p className="np-sub">Create a new annotation project</p>

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
             <button type="button" className="np-small-btn" onClick={handleAddCollaborator}>Add</button>
            </div>

            <div className="np-collab-chips">
              {collaborators.map((c) => (
                <div className="np-chip" key={c}>
                  <span className="np-chip-text">{c}</span>
                  <button type="button" className="np-chip-x" onClick={() => handleRemoveCollaborator(c)}>✕</button>
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
