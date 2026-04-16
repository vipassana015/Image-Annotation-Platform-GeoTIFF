import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";
import api from "../api/axios";
import "./DatasetsPage.css";
import "./MembersPage.css";

export default function MembersPage() {
  const { projectId } = useParams();
  const dropdownRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");

  const [project, setProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [openRole, setOpenRole] = useState(null);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

/*--------------------Fetch Project----------------------*/

  useEffect(() => {
  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    }
  };

  fetchProject();
}, [projectId]);


/*--------------------Fetch Members---------------------*/

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/members/`)
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);


/*--------------------Add Members----------------------*/

 const handleAddMember = async () => {
  if (!newMember.trim()) return;

  try {
    await api.post(
      `/api/projects/${projectId}/members/add/`,
      {
        identifier: newMember,
        role: "annotator",
      }
    );

    setNewMember("");
    setToast({ type: "success", message: "Member added" });

    fetchMembers();

  } catch (err) {
    const msg =
      err.response?.data?.detail || "Failed to add member";

    setToast({ type: "error", message: msg });
  }

  setTimeout(() => setToast(null), 3000);
};

/*--------------------Remove Members----------------------*/

const handleRemoveMember = async (userId) => {
  try {
    await api.delete(
      `/api/projects/${projectId}/members/remove/${userId}/`
    );

    setMembers((prev) =>
      prev.filter((m) => m.user !== userId)
    );

  } catch (err) {
    console.error(err);
  }
};
/*--------------------Change Role----------------------*/

const handleRoleChange = async (userId, newRole) => {
  try {
    await api.patch(
      `/api/projects/${projectId}/members/${userId}/role/`,
      { role: newRole }
    );

    // ⚡ instant UI update
    setMembers((prev) =>
      prev.map((m) =>
        m.user === userId ? { ...m, role: newRole } : m
      )
    );

  } catch (err) {
    console.error(err);
  }
};


useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setOpenRole(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);




  if (!project) return null;
  return (
  <ProjectSidebarLayout
    project={project}
    projectId={projectId}
    activeTab="members"
  >
    <div className="annotate-main">

      {/* ---------- Breadcrumb ---------- */}
      <div className="upload-header-left">
        <div className="breadcrumb-row">
          <span className="project-name-bc">{project.name}</span>
          <span className="bc-sep">›</span>
          <span className="current-tab">Members</span>
        </div>
      </div>

      <div className="annotate-content">
  <div className="members-container">

    {/* HEADER */}
    <div className="members-header">

      <div className="members-add-row">

  {/* ADD MEMBER */}
<input
  type="text"
  placeholder="Add member by username or email"
  value={newMember}
  onChange={(e) => setNewMember(e.target.value)}
  className="np-input members-input"
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  }}
/>

  <button
  className="create-project"
  onClick={handleAddMember}
  disabled={!newMember.trim()}
>
  Add Member
</button>

</div>

    </div>

    {toast && (
  <div className={`toast ${toast.type}`}>
    {toast.message}
  </div>
)}


    {/* MEMBERS LIST */}
    <div className="members-list">
      {members.map((m) => (
        <div className="member-card" key={m.id}>

            {members.length === 0 && (
  <div className="empty-state">
    "No members yet. Add collaborators to get started."
  </div>
)}

          {/* LEFT */}
          <div className="member-info-row">

  <div className="member-avatar">
    {m.username.charAt(0).toUpperCase()}
  </div>

  <div className="member-info">
    <div className="member-name">{m.username}</div>
    <div className="member-email">{m.email}</div>
  </div>

</div>

          <div className="member-actions">

  {/* ROLE DROPDOWN */}
  {m.role === "owner" ? (
    <span className="role-badge role-owner">Owner</span>
  ) : (
   <div
  className={`role-wrapper ${openRole === m.id ? "active" : ""}`}
>

  <div
 className={`role-pill ${m.role} ${openRole === m.id ? "open" : ""}`}
  onClick={(e) => {
    e.stopPropagation();
    setOpenRole(openRole === m.id ? null : m.id);
  }}
>
    {m.role}
    <ChevronDown size={14} className="dropdown-arrow" />
  </div>

 

  {openRole === m.id && (
    <div className="role-menu">
      {["annotator", "admin", "viewer"].map((role) => (
        <div
          key={role}
          className="role-option"
          onClick={() => {
            handleRoleChange(m.user, role);
            setOpenRole(null);
          }}
        >
          {role}
        </div>
      ))}
    </div>
  )}

</div>
  )}

  {/* REMOVE BUTTON */}
  {m.role !== "owner" && (
    <span
      className="remove-btn"
      onClick={() => handleRemoveMember(m.user)}
    >
      Remove
    </span>
  )}

</div>

        </div>
      ))}
    </div>

  </div>
</div>
    </div>
  </ProjectSidebarLayout>
);
}