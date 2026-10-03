import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import Button from "../common/Button";

const menu = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/profile", label: "Profile" },
  { to: "/admin/project", label: "Project" },
  { to: "/admin/karir", label: "Karir" },
  { to: "/admin/pendidikan", label: "Pendidikan" },
  { to: "/admin/sertifikat", label: "Sertifikat" },
  { to: "/admin/skill", label: "Skill" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Local logout still clears an expired session.
    } finally {
      logout();

      navigate("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-black">
      <aside className="w-full md:w-56 md:shrink-0 border-b md:border-b-0 md:border-r border-black/10 flex flex-col justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-semibold mb-6">{user?.name || "Admin"}</p>
          <nav className="flex flex-wrap md:flex-col gap-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-black text-white" : "hover:bg-black/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
