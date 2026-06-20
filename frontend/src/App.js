import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import NewProjectPage from "./pages/NewProjectPage";
import AnnotatePage from "./pages/AnnotatePage";
import ProjectEntryPage from "./pages/ProjectEntryPage";
import ImageAnnotatePage from "./pages/annotate/ImageAnnotatePage";
import DatasetsPage from "./pages/DatasetsPage";
import DatasetDetailPage from "./pages/DatasetDetailPage";
import MembersPage from "./pages/MembersPage";
import ExportPage from "./pages/ExportPage";
import ClassesPage from "./pages/ClassesPage"; 
import HelpPage from "./pages/HelpPage";
import TrashPage from "./pages/TrashPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/recent" />} />
        <Route path="/dashboard/:tab" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:projectId/upload" element={<UploadPage />} />
        <Route path="/projects/:projectId" element={<ProjectEntryPage />} />
        <Route path="/projects/:projectId/annotate" element={<AnnotatePage />} />
        <Route path="/projects/:projectId/annotate/:batchId" element={<AnnotatePage />} />
        <Route path="/projects/:projectId/annotate/:batchId/:imageId" element={<ImageAnnotatePage />} />
        <Route path="/projects/:projectId/datasets" element={<DatasetsPage />}/>
        <Route path="/projects/:projectId/datasets/:datasetId" element={<DatasetDetailPage />}/>
        <Route path="/projects/:projectId/members" element={<MembersPage />} />
        <Route path="/projects/:projectId/export" element={<ExportPage />} />
        <Route path="/projects/:projectId/classes" element={<ClassesPage />} />
        <Route path="/dashboard/trash" element={<TrashPage />} />
        <Route path="/dashboard/help" element={<HelpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
