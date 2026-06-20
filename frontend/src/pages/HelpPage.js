import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { HelpCircle, ChevronDown, ChevronUp, Mail, BookOpen, MessageCircle } from "lucide-react";
import "./HelpPage.css";

const BASE_URL = "http://127.0.0.1:8000";

const FAQ_ITEMS = [
  {
    question: "How do I create a new project?",
    answer: "Click the '+ Create Project' button on the dashboard. Give your project a name, description, and visibility setting, then click Create.",
  },
  {
    question: "How do I upload images?",
    answer: "Open a project, go to the Upload section, create or select a batch, and drag & drop your GeoTIFF images.",
  },
  {
    question: "How do I add team members?",
    answer: "Inside a project, go to the Members page. Enter the username or email of the person and assign them a role (Admin, Annotator, or Viewer).",
  },
  {
    question: "How do I annotate an image?",
    answer: "Open a project, select a batch, then click on an image to open the annotation editor. Use the bounding box tool to draw annotations and assign class labels.",
  },
  {
    question: "How do I export annotations?",
    answer: "Go to the Export page inside a project. Select a dataset and choose your format (YOLO or COCO), then click Export.",
  },
  {
    question: "How does Trash work?",
    answer: "Deleting a project moves it to Trash where it stays for 30 days. You can restore it anytime or permanently delete it from the Trash page.",
  },
  {
    question: "How do I change a member's role?",
    answer: "Go to the Members page inside a project. Click the role dropdown next to the member's name and select a new role.",
  },
];

function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUsername(res.data.username));

    axios
      .get(`${BASE_URL}/api/notifications/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(res.data));
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="dashboard">
      <Sidebar
        username={username}
        activeTab="help"
        setActiveTab={() => {}}
        unreadCount={unreadCount}
      />

      <div className="dashboard-main">
        <div className="help-container">

          {/* Header */}
          <div className="help-header">
            <h2><HelpCircle size={22} /> Help & Support</h2>
            <p className="help-subtitle">Find answers to common questions or reach out to us.</p>
          </div>

          {/* Quick Links */}
          <div className="help-cards">
            <div className="help-card">
              <BookOpen size={24} />
              <h4>Documentation</h4>
              <p>Browse guides and tutorials for using the annotation tool.</p>
            </div>
            <div className="help-card">
              <MessageCircle size={24} />
              <h4>Community</h4>
              <p>Ask questions and share tips with other users.</p>
            </div>
            <div className="help-card">
              <Mail size={24} />
              <h4>Contact Us</h4>
              <p>Email us at <a href="mailto:info@vasundharaa.in">info@vasundharaa.in</a></p>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>

            {FAQ_ITEMS.map((item, index) => (
              <div
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                key={index}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{item.question}</span>
                  {openFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {openFaq === index && (
                  <div className="faq-answer">{item.answer}</div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default HelpPage;