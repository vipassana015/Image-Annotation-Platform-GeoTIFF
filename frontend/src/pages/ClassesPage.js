import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";
import "./ClassPage.css";

export default function ClassesPage() {
  const { projectId } = useParams();
  const [classes, setClasses] = useState([]);
  const [project, setProject] = useState(null);

  const [showModal, setShowModal] = useState(false);
const [newClass, setNewClass] = useState({
  name: "",
  color: "#9ca3af",
  description: "",
});

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchClasses();
    fetchProject();
  }, []);

  const fetchProject = async () => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/api/projects/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setProject(res.data);
  } catch (err) {
    console.error(err);
  }
};

  const fetchClasses = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${projectId}/classes/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClasses(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  const handleCreate = async () => {
  try {
    await axios.post(
  `http://127.0.0.1:8000/api/projects/${projectId}/classes/`,
  {
    ...newClass,
    project: projectId,   // 🔥 VERY IMPORTANT
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    setShowModal(false);

    // reset form
    setNewClass({
      name: "",
      color: "#9ca3af",
      description: "",
    });

    // refresh list
    fetchClasses();

  } catch (err) {
    console.error("CREATE ERROR:", err.response?.data || err);
  }
};

  return (
  <ProjectSidebarLayout project={project} projectId={projectId}>
    <div className="classes-container">
<div className="section-title">
  <span className="project-title">{project?.name}</span>
  <span className="separator"> &gt; </span>
  <span className="page-name">Classes</span>
</div>

      {classes.length === 0 ? (
        <div className="empty-state">No classes created</div>
      ) : (
        <div className="classes-list">
          {classes.map((cls) => (
            <div key={cls.id} className="class-card">

              <div className="class-info">
                <div
                  className="class-color"
                  style={{ background: cls.color }}
                />
                <div>
                  <div className="class-name">{cls.name}</div>
                  <div className="class-desc">
                    {cls.description || "No description"}
                  </div>
                </div>
              </div>

              <div className="class-usage">
                {cls.usage_count} annotations
              </div>

            </div>
          ))}
        </div>
      )}

    </div>

    {showModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h3>Create Class</h3>

      <input
        type="text"
        placeholder="Class name"
        value={newClass.name}
        onChange={(e) =>
          setNewClass({ ...newClass, name: e.target.value })
        }
      />

      <input
        type="color"
        value={newClass.color}
        onChange={(e) =>
          setNewClass({ ...newClass, color: e.target.value })
        }
      />

      <textarea
        placeholder="Description (optional)"
        value={newClass.description}
        onChange={(e) =>
          setNewClass({ ...newClass, description: e.target.value })
        }
      />

      <div className="modal-actions">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button onClick={handleCreate}>Create</button>
      </div>

    </div>
  </div>
)}
  </ProjectSidebarLayout>
);
}