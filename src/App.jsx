import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/admin/Profile";
import ProjectList from "./pages/admin/project/ProjectList";
import ProjectForm from "./pages/admin/project/ProjectForm";
import KarirList from "./pages/admin/karir/KarirList";
import KarirForm from "./pages/admin/karir/KarirForm";
import PendidikanList from "./pages/admin/pendidikan/PendidikanList";
import PendidikanForm from "./pages/admin/pendidikan/PendidikanForm";
import SertifikatList from "./pages/admin/sertifikat/SertifikatList";
import SertifikatForm from "./pages/admin/sertifikat/SertifikatForm";
import SkillList from "./pages/admin/skill/SkillList";
import SkillForm from "./pages/admin/skill/SkillForm";
import Home from "./pages/guest/Home";
import ProjectDetail from "./pages/guest/ProjectDetail";
import Collection from "./pages/guest/Collection";
import NotFound from "./pages/guest/NotFound";
import GuestLayout from "./components/guest/GuestLayout";
import { PortofolioProvider } from "./context/PortofolioContext";

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        element={
          <PortofolioProvider>
            <GuestLayout />
          </PortofolioProvider>
        }
      >
        <Route index element={<Home />} />
        <Route path="projects" element={<Collection />} />
        <Route path="sertifikat" element={<Collection key="certificates" certificate />} />
        <Route path="project/:id" element={<ProjectDetail />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="project" element={<ProjectList />} />
        <Route path="project/new" element={<ProjectForm />} />
        <Route path="project/:id" element={<ProjectForm />} />
        <Route path="karir" element={<KarirList />} />
        <Route path="karir/new" element={<KarirForm />} />
        <Route path="karir/:id" element={<KarirForm />} />

        <Route path="pendidikan" element={<PendidikanList />} />
        <Route path="pendidikan/new" element={<PendidikanForm />} />
        <Route path="pendidikan/:id" element={<PendidikanForm />} />
        <Route path="sertifikat" element={<SertifikatList />} />
        <Route path="sertifikat/new" element={<SertifikatForm />} />
        <Route path="sertifikat/:id" element={<SertifikatForm />} />

        <Route path="skill" element={<SkillList />} />
        <Route path="skill/new" element={<SkillForm />} />
        <Route path="skill/:id" element={<SkillForm />} />
      </Route>
      <Route element={<PortofolioProvider><GuestLayout /></PortofolioProvider>}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
