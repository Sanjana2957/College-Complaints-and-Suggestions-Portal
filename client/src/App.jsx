import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminAccountPage from "./components/AdminAccountPage";

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("student-login");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    apiRequest("/auth/me").then((currentUser) => {
      setUser(currentUser);
    }).catch(() => {
      setUser(null);
    }).finally(() => setChecking(false));
  }, []);

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    setUser(null);
    setScreen("student-login");
  }

  function backToAdminDashboard() {
    setScreen("admin-dashboard");
  }

  if (checking) return <p className="loading">Loading portal...</p>;
  if (user) return <main className="app-shell">
    {user.role === "student" && <StudentDashboard user={user} onLogout={logout} />}
    {user.role === "admin" && screen === "admin-create" && <AdminAccountPage onBack={backToAdminDashboard} />}
    {user.role === "admin" && screen !== "admin-create" && <AdminDashboard user={user} onLogout={logout} onNewAdmin={() => setScreen("admin-create")} />}
  </main>;

  return (
    <main className="auth-page">
      <header className="brand">
        <p className="eyebrow">FSD-2 project</p>
        <h1>College Complaint & Suggestion Portal</h1>
        <p>Share concerns and suggestions with your college administration.</p>
      </header>
      <div className="auth-switch">
        <button className={screen !== "admin-login" ? "switch active" : "switch"} onClick={() => setScreen("student-login")}>Student Login</button>
        <button className={screen === "admin-login" ? "switch active" : "switch"} onClick={() => setScreen("admin-login")}>Admin Login</button>
      </div>
      {screen === "register" && <Register onLogin={setUser} onBack={() => setScreen("student-login")} />}
      {screen === "student-login" && <Login role="student" onLogin={setUser} onRegister={() => setScreen("register")} />}
      {screen === "admin-login" && <Login role="admin" onLogin={setUser} />}
      {screen === "admin-create" && <AdminAccountPage onBack={() => setScreen("admin-login")} />}
    </main>
  );
}

export default App;
