import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Trash2, RotateCcw, X } from "lucide-react";
import "./TrashPage.css";

const BASE_URL = "http://127.0.0.1:8000";

function TrashPage() {
  const [trashedProjects, setTrashedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("access_token");
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchTrashed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/trash/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashedProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch trash", err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsername(res.data.username));

    axios
      .get(`${BASE_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data));

    fetchTrashed();
  }, [token, fetchTrashed]);

  const handleRestore = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/projects/${id}/restore/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrashedProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Restore failed", err);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/projects/${id}/permanent-delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashedProjects((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Permanent delete failed", err);
    }
  };

  const daysLeft = (deletedAt) => {
    if (!deletedAt) return "?";
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="dashboard">
      <Sidebar
        username={username}
        activeTab="trash"
        setActiveTab={() => {}}
        unreadCount={unreadCount}
      />

      <div className="dashboard-main">
        <div className="trash-container">
          <div className="trash-header">
            <h2><Trash2 size={20} /> Trash</h2>
            <p className="trash-subtitle">
              Projects in trash are kept for 30 days before being permanently deleted.
            </p>
          </div>

          {loading ? (
            <p className="trash-empty">Loading...</p>
          ) : trashedProjects.length === 0 ? (
            <div className="trash-empty-state">
              <Trash2 size={48} strokeWidth={1} />
              <p>Trash is empty</p>
            </div>
          ) : (
            <div className="trash-list">
              {trashedProjects.map((p) => (
                <div className="trash-row" key={p.id}>
                  <div className="trash-row-info">
                    <span className="trash-project-name">{p.name}</span>
                    <span className="trash-expires">
                      Expires in {daysLeft(p.deleted_at)} days
                    </span>
                  </div>
                  <div className="trash-row-actions">
                    <button
                      className="btn-restore"
                      onClick={() => handleRestore(p.id)}
                      title="Restore"
                    >
                      <RotateCcw size={15} /> Restore
                    </button>
                    <button
                      className="btn-perm-delete"
                      onClick={() => setConfirmDelete(p.id)}
                      title="Delete Permanently"
                    >
                      <X size={15} /> Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Permanently delete this project? This cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="danger"
                onClick={() => handlePermanentDelete(confirmDelete)}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrashPage;