import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import './Dashboard.css';
import { useNavigate, useParams } from 'react-router-dom';
import SortDropdown from "../components/SortDropdown";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const [loading, setLoading] = useState(false);
  const [username, setUsername ] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || "recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const PROJECT_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
];

const [projectSort, setProjectSort] = useState(PROJECT_SORT_OPTIONS[0]);

  useEffect(() => {
  if (tab) {
    setActiveTab(tab);
  }
}, [tab]);
  

  const navigate = useNavigate();
 


const BASE_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");

const handleProjectDeleteClick = (id) => {
  setProjectToDelete(id);
};

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300); // delay

  return () => clearTimeout(timer);
}, [searchQuery]);


const confirmProjectDelete = async () => {
  try {
    await axios.patch(`${BASE_URL}/api/projects/${projectToDelete}/trash/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setProjects(prev =>
      prev.filter(p => p.id !== projectToDelete)
    );

    setProjectToDelete(null);

  } catch (err) {
    console.error("Delete failed", err);
  }
};


const filteredProjects = projects.filter((p) =>
  p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
);

const sortedProjects = [...filteredProjects].sort((a, b) => {
  switch (projectSort.value) {
    case "newest":
      return new Date(b.last_edited) - new Date(a.last_edited);
    case "oldest":
      return new Date(a.last_edited) - new Date(b.last_edited);
    case "name-asc":
      return a.name.localeCompare(b.name);
    case "name-desc":
      return b.name.localeCompare(a.name);
    default:
      return 0;
  }
});

/*--------------Fetch Activity------------------*/

const fetchActivity = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) return;

  try {
    const res = await axios.get(`${BASE_URL}/api/activity/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setActivity(res.data);
  } catch (err) {
    console.error("Activity fetch failed:", err);
  }
};

/*--------------Fetch Notification------------------*/

const fetchNotifications = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(`${BASE_URL}/api/notifications/`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  setNotifications(res.data);
};

const fetchRecentProjects = async () => {
  setLoading(true);
  const res = await axios.get(`${BASE_URL}/api/projects/recent/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setProjects(res.data);
  setLoading(false);
};

const fetchOwnedProjects = async () => {
  setLoading(true);
  const res = await axios.get(`${BASE_URL}/api/projects/owned/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setProjects(res.data);
  setLoading(false);
};

const fetchSharedProjects = async () => {
  setLoading(true);
  const res = await axios.get(`${BASE_URL}/api/projects/shared/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setProjects(res.data);
  setLoading(false); 
};

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (activeTab === "recent") {
    fetchRecentProjects();
  } else if (activeTab === "all") {
    fetchOwnedProjects();
  } else if (activeTab === "shared") {
    fetchSharedProjects();
  } else if (activeTab === "activity") {
    fetchActivity();
  } else if (activeTab === "notifications") {
    fetchNotifications();
  } else {
    setProjects([]);
  }
}, [activeTab]);

useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    navigate("/login");
    return;
  }

  axios.get("http://127.0.0.1:8000/api/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((res) => {
    setUsername(res.data.username);
  })
  .catch(() => {
    navigate("/login");
  });

  fetchNotifications();

}, [navigate]);


/*----------------Group By-----------------*/

const groupActivities = (activities) => {
  const groups = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  const now = new Date();

  activities.forEach((a) => {
    const date = new Date(a.created_at);

    const diff = (now - date) / (1000 * 60 * 60 * 24);

    if (diff < 1) {
      groups.today.push(a);
    } else if (diff < 2) {
      groups.yesterday.push(a);
    } else {
      groups.earlier.push(a);
    }
  });

  return groups;
};


const grouped = groupActivities(activity);

const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + " min ago";
  if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
  return Math.floor(diff / 86400) + " days ago";
};

const markAsRead = async (id) => {
  const token = localStorage.getItem("access_token");

  await axios.patch(`${BASE_URL}/api/notifications/${id}/read/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // update UI instantly
  setNotifications((prev) =>
    prev.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    )
  );
};

const markAllAsRead = async () => {
  const token = localStorage.getItem("access_token");

  await axios.patch(`${BASE_URL}/api/notifications/read-all/`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

  setNotifications((prev) =>
    prev.map((n) => ({ ...n, is_read: true }))
  );
};


const handleNotificationClick = async (n) => {
  await markAsRead(n.id);

  navigate(`/projects/${n.project_id}`);
};

useEffect(() => {
  const socket = new WebSocket("ws://127.0.0.1:8000/ws/notifications/");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    setNotifications((prev) => [
      {
        ...data,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return () => socket.close();
}, []);


  return (
    <div className="dashboard">
      <Sidebar
      username={username}
      setActiveTab={setActiveTab} 
      activeTab={activeTab} 
       unreadCount={unreadCount}
      />

      <div className="dashboard-main">
       <Topbar
       onCreate={() => navigate("/projects/new")}
       setActiveTab={setActiveTab} 
       activeTab={activeTab} 
       sortComponent={
       <SortDropdown
       value={projectSort}
       options={PROJECT_SORT_OPTIONS}
       onChange={setProjectSort}
       />
      }
       searchQuery={searchQuery}
       setSearchQuery={setSearchQuery}
       />


  {loading ? (
  <p>Loading...</p>

) : activeTab === "notifications" ? (

<>
  <div className="notification-header">
    <h3>Notifications</h3>

    {unreadCount > 0 && (
      <button className="mark-all" onClick={markAllAsRead}>
        Mark all as read
      </button>
    )}
  </div>

  <div className="notification-list">
    {notifications.length > 0 ? (
      notifications.map((n) => (
        <div
          key={n.id}
          className="notification-row"
          onClick={() => handleNotificationClick(n)}
        >
          {!n.is_read && <div className="unread-dot" />}

          <div className="notification-content">
            <p className="notification-text">{n.message}</p>
            <span className="notification-time">
              {timeAgo(n.created_at)}
            </span>
          </div>
        </div>
      ))
    ) : (
      <p>No notifications.</p>
    )}
  </div>
</>
) : activeTab === "activity" ? (

     <div className="activity-container">
   <div className="activity-list">

  {["today", "yesterday", "earlier"].map((section) => (
    grouped[section].length > 0 && (
      <div key={section}>
        <h4 className="activity-group-title">
          {section === "today" && "Today"}
          {section === "yesterday" && "Yesterday"}
          {section === "earlier" && "Earlier"}
        </h4>

        {grouped[section].map((a) => (
          <div key={a.id} className="activity-row">

            <div className="activity-content">

              <p className="activity-text">
                <strong>{a.username}</strong> {a.message}
              </p>
            </div>

            <span className="activity-time">
              {timeAgo(a.created_at)}
            </span>

          </div>
        ))}
      </div>
    )
  ))}

</div>

</div>

) : (
  <div className="project-grid">
    {sortedProjects.length > 0 ? (
  sortedProjects.map((p) => (
    <ProjectCard
      key={p.id}
      project={p}
      username={username}
      onDelete={handleProjectDeleteClick}
    />
  ))
) : (
  <p>
    {searchQuery
      ? "No projects match your search."
      : activeTab === "recent"
      ? "No recently viewed projects yet."
      : activeTab === "all"
      ? "You haven't created any projects yet."
      : "No projects have been shared with you."}
  </p>
)}
  </div>
)}



        

      </div>

      {projectToDelete && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>Delete this project?</p>

      <div className="modal-actions">
        <button onClick={() => setProjectToDelete(null)}>
          Cancel
        </button>
        <button onClick={confirmProjectDelete}>
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Dashboard;