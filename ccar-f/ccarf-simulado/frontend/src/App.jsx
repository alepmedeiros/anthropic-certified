import { useState } from "react";
import { setToken } from "./api/client";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import DomainQuiz from "./components/DomainQuiz";
import FullExam from "./components/FullExam";
import ExamResult from "./components/ExamResult";
import { wrapStyle, colors } from "./theme";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard | quiz | exam | examResult
  const [activeDomain, setActiveDomain] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [hasToken] = useState(() => Boolean(localStorage.getItem("ccarf-token")));

  const logout = () => {
    setToken(null);
    setUser(null);
    window.location.reload();
  };

  if (!user && !hasToken) {
    return <Login onAuthenticated={setUser} />;
  }

  const backToDashboard = () => {
    setView("dashboard");
    setDashboardKey((k) => k + 1);
  };

  let body;
  if (view === "quiz") {
    body = <DomainQuiz domainId={activeDomain} onDone={backToDashboard} />;
  } else if (view === "exam") {
    body = (
      <FullExam
        onDone={(result) => {
          setExamResult(result);
          setView("examResult");
        }}
      />
    );
  } else if (view === "examResult") {
    body = <ExamResult result={examResult} onDone={backToDashboard} />;
  } else {
    body = (
      <Dashboard
        refreshKey={dashboardKey}
        onPractice={(domainId) => {
          setActiveDomain(domainId);
          setView("quiz");
        }}
        onFullExam={() => setView("exam")}
      />
    );
  }

  return (
    <div>
      <div style={{ ...wrapStyle, padding: "0.5rem 1.5rem", marginBottom: 0, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={logout}
          style={{ background: "none", border: "none", color: colors.textDim, cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}
        >
          sign out
        </button>
      </div>
      {body}
    </div>
  );
}
