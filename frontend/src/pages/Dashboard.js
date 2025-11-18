import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');

    if (!userId) {
      // If no user logged in, redirect to login page
      navigate('/login');
      return;
    }

    setUsername(storedUsername);

    // Fetch projects for this user
    axios
      .get(`http://127.0.0.1:8000/api/projects/?user_id=${userId}`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects:', err));
  }, [navigate]);

  return (
    <div className="dashboard">
      <Sidebar username={username} />
      <div className="dashboard-main">
        <Topbar />
        <div className="project-grid">
          {projects.length > 0 ? (
            projects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p>No projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
