import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ProjectEntryPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  useEffect(() => {
    const decideRoute = async () => {
      try {
        const res = await axios.get(
          `${API}/api/projects/${projectId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const project = res.data;

        if (project.image_count > 0) {
          navigate(`/projects/${projectId}/annotate`, { replace: true });
        } else {
          navigate(`/projects/${projectId}/upload`, { replace: true });
        }

      } catch (err) {
        console.error("Failed to load project", err);
        navigate("/dashboard");
      }
    };

    decideRoute();
  }, [projectId, navigate]);

  return null; // this page only redirects
}

export default ProjectEntryPage;
