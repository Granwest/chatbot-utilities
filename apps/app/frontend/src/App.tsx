import React, { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<"feedback" | "history">(
    "feedback"
  );
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [historyUsers, setHistoryUsers] = useState<string[]>([]);
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHistoryDateRange, setSelectedHistoryDateRange] =
    useState<string>("All");
  const [selectedFeedbackDateRange, setSelectedFeedbackDateRange] =
    useState<string>("All");

  React.useEffect(() => {
    if (activeTab === "feedback") {
      fetch("/feedback/users")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.users)) {
            setUsers(data.users);
          } else if (Array.isArray(data)) {
            setUsers(data);
          }
        })
        .catch(() => setUsers([]));
    } else if (activeTab === "history") {
      fetch("/history/users")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.users)) {
            setHistoryUsers(data.users);
          } else if (Array.isArray(data)) {
            setHistoryUsers(data);
          }
        })
        .catch(() => setHistoryUsers([]));
    }
  }, [activeTab]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/feedback";
      const params = [];
      if (selectedUser) {
        params.push(`user=${encodeURIComponent(selectedUser)}`);
      }
      if (feedbackType && feedbackType !== "All") {
        params.push(`type=${encodeURIComponent(feedbackType.toLowerCase())}`);
      }
      // Date range calculation
      let startDate: number | null = null;
      let endDate: number | null = null;
      const now = new Date();
      switch (selectedFeedbackDateRange) {
        case "Today": {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          startDate = start.getTime();
          endDate = startDate + 24 * 60 * 60 * 1000 - 1;
          break;
        }
        case "Yesterday": {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          startDate = start.getTime();
          endDate = startDate + 24 * 60 * 60 * 1000 - 1;
          break;
        }
        case "This Week": {
          const dayOfWeek = now.getDay(); // 0=Sunday
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek
          );
          startDate = start.getTime();
          endDate = now.getTime();
          break;
        }
        case "Last 7 days": {
          startDate = now.getTime() - 6 * 24 * 60 * 60 * 1000;
          endDate = now.getTime();
          break;
        }
        case "Last 30 days": {
          startDate = now.getTime() - 29 * 24 * 60 * 60 * 1000;
          endDate = now.getTime();
          break;
        }
        default:
          break;
      }
      if (
        selectedFeedbackDateRange !== "All" &&
        startDate !== null &&
        endDate !== null
      ) {
        params.push(`start_date=${startDate}`);
        params.push(`end_date=${endDate}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      const data = await response.json();
      let items = Array.isArray(data.feedback)
        ? data.feedback
        : [data.feedback];
      items = items.slice().sort((a, b) => {
        let ta =
          typeof a.timestamp === "string" && /^\d+$/.test(a.timestamp)
            ? parseInt(a.timestamp, 10)
            : new Date(a.timestamp).getTime();
        let tb =
          typeof b.timestamp === "string" && /^\d+$/.test(b.timestamp)
            ? parseInt(b.timestamp, 10)
            : new Date(b.timestamp).getTime();
        return tb - ta;
      });
      setFeedbackData(items);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      let url = "/history";
      const params = [];
      if (selectedHistoryUser) {
        params.push(`user=${encodeURIComponent(selectedHistoryUser)}`);
      }
      // Date range calculation
      let startDate: number | null = null;
      let endDate: number | null = null;
      const now = new Date();
      switch (selectedHistoryDateRange) {
        case "Today": {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          startDate = start.getTime();
          endDate = startDate + 24 * 60 * 60 * 1000 - 1;
          break;
        }
        case "Yesterday": {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          startDate = start.getTime();
          endDate = startDate + 24 * 60 * 60 * 1000 - 1;
          break;
        }
        case "This Week": {
          const dayOfWeek = now.getDay(); // 0=Sunday
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek
          );
          startDate = start.getTime();
          endDate = now.getTime();
          break;
        }
        case "Last 7 days": {
          startDate = now.getTime() - 6 * 24 * 60 * 60 * 1000;
          endDate = now.getTime();
          break;
        }
        case "Last 30 days": {
          startDate = now.getTime() - 29 * 24 * 60 * 60 * 1000;
          endDate = now.getTime();
          break;
        }
        default:
          break;
      }
      if (
        selectedHistoryDateRange !== "All" &&
        startDate !== null &&
        endDate !== null
      ) {
        params.push(`start_date=${startDate}`);
        params.push(`end_date=${endDate}`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const data = await response.json();
      let items = Array.isArray(data.feedback)
        ? data.feedback
        : [data.feedback];
      items = items.slice().sort((a, b) => {
        let ta =
          typeof a.timestamp === "string" && /^\d+$/.test(a.timestamp)
            ? parseInt(a.timestamp, 10)
            : new Date(a.timestamp).getTime();
        let tb =
          typeof b.timestamp === "string" && /^\d+$/.test(b.timestamp)
            ? parseInt(b.timestamp, 10)
            : new Date(b.timestamp).getTime();
        return tb - ta;
      });
      setHistoryData(
        Array.isArray(data.history) ? data.history : [data.history]
      );
    } catch (err: any) {
      setHistoryError(err.message || "Unknown error");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ccc",
          marginBottom: 16,
          paddingBottom: 8,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginRight: 32,
            fontSize: "2rem",
            fontWeight: 700,
          }}
        >
          Feedback Viewer
        </h1>
        <div style={{ display: "flex" }}>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                activeTab === "feedback"
                  ? "2px solid #007bff"
                  : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: activeTab === "feedback" ? "bold" : "normal",
              color: activeTab === "feedback" ? "#007bff" : "#333",
              outline: "none",
            }}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback
          </button>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                activeTab === "history"
                  ? "2px solid #007bff"
                  : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: activeTab === "history" ? "bold" : "normal",
              color: activeTab === "history" ? "#007bff" : "#333",
              outline: "none",
            }}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {activeTab === "feedback" && (
          <div>
            <h2>Feedback</h2>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
              }}
            >
              <label htmlFor="userDropdown" style={{ marginRight: 8 }}>
                User:
              </label>
              <select
                id="userDropdown"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <label htmlFor="typeDropdown" style={{ marginRight: 8 }}>
                Type:
              </label>
              <select
                id="typeDropdown"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              >
                <option value="All">All</option>
                <option value="Up">Up</option>
                <option value="Down">Down</option>
              </select>
              <label
                htmlFor="feedbackDateRangeDropdown"
                style={{ marginRight: 8 }}
              >
                Date:
              </label>
              <select
                id="feedbackDateRangeDropdown"
                value={selectedFeedbackDateRange}
                onChange={(e) => setSelectedFeedbackDateRange(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
              <button
                onClick={fetchFeedback}
                style={{
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
            {error && (
              <div style={{ color: "red", marginBottom: 8 }}>{error}</div>
            )}
            <div>
              {feedbackData.length === 0 && !loading && (
                <p>No feedback found.</p>
              )}
              {feedbackData.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {feedbackData.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e1e4e8",
                        borderRadius: 8,
                        padding: "16px",
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "12px",
                            background:
                              item.type === "up"
                                ? "#d4edda"
                                : item.type === "down"
                                ? "#f8d7da"
                                : "#e1e4e8",
                            color:
                              item.type === "up"
                                ? "#155724"
                                : item.type === "down"
                                ? "#721c24"
                                : "#333",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            border: "1px solid #e1e4e8",
                          }}
                        >
                          {item.type ? item.type.toUpperCase() : "TYPE MISSING"}
                        </span>
                      </div>
                      <div>
                        <strong>ID:</strong> {item.id}
                      </div>
                      <div>
                        <strong>Session:</strong> {item.session_id}
                      </div>
                      <div>
                        <strong>User:</strong> {item.entra_oid}
                      </div>
                      <div>
                        <strong>Timestamp:</strong>{" "}
                        {(() => {
                          let ts = item.timestamp;
                          // If it's a string containing only digits, treat as ms since epoch
                          if (typeof ts === "string" && /^\d+$/.test(ts)) {
                            ts = parseInt(ts, 10);
                          }
                          // If ts is a 13-digit number, treat as ms; if 10-digit, treat as seconds
                          if (typeof ts === "number" && ts < 1e12) {
                            ts = ts * 1000;
                          }
                          const d = new Date(ts);
                          return isNaN(d.getTime())
                            ? item.timestamp
                            : d.toLocaleString();
                        })()}
                      </div>
                      <div>
                        <strong>Question:</strong> {item.question}
                      </div>
                      {item.rewritten_question && (
                        <div>
                          <strong>Rewritten Question:</strong>{" "}
                          {item.rewritten_question}
                        </div>
                      )}
                      <div>
                        <strong>Answer:</strong> {item.answer}
                      </div>
                      <div>
                        <strong>Text:</strong> {item.text}
                      </div>
                      <div>
                        <strong>Type:</strong> {item.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div>
            <h2>History</h2>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
              }}
            >
              <label htmlFor="historyUserDropdown" style={{ marginRight: 8 }}>
                User:
              </label>
              <select
                id="historyUserDropdown"
                value={selectedHistoryUser}
                onChange={(e) => setSelectedHistoryUser(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              >
                <option value="">All Users</option>
                {historyUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <label
                htmlFor="historyDateRangeDropdown"
                style={{ marginRight: 8 }}
              >
                Date:
              </label>
              <select
                id="historyDateRangeDropdown"
                value={selectedHistoryDateRange}
                onChange={(e) => setSelectedHistoryDateRange(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginRight: 16,
                }}
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
              </select>
              <button
                onClick={fetchHistory}
                style={{
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: "bold",
                  marginBottom: 16,
                }}
                disabled={historyLoading}
              >
                {historyLoading ? "Loading..." : "Submit"}
              </button>
            </div>
            {historyError && (
              <div style={{ color: "red", marginBottom: 8 }}>
                {historyError}
              </div>
            )}
            <div>
              {historyData.length === 0 && !historyLoading && (
                <p>No history found.</p>
              )}
              {historyData.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {historyData.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #e1e4e8",
                        borderRadius: 8,
                        padding: "16px",
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          marginBottom: 4,
                        }}
                      >
                        History
                      </div>
                      <div>
                        <strong>ID:</strong> {item.id}
                      </div>
                      <div>
                        <strong>Session:</strong> {item.session_id}
                      </div>
                      <div>
                        <strong>User:</strong> {item.entra_oid}
                      </div>
                      <div>
                        <strong>Timestamp:</strong>{" "}
                        {(() => {
                          let ts = item.timestamp;
                          // If it's a string containing only digits, treat as ms since epoch
                          if (typeof ts === "string" && /^\d+$/.test(ts)) {
                            ts = parseInt(ts, 10);
                          }
                          // If ts is a 13-digit number, treat as ms; if 10-digit, treat as seconds
                          if (typeof ts === "number" && ts < 1e12) {
                            ts = ts * 1000;
                          }
                          const d = new Date(ts);
                          return isNaN(d.getTime())
                            ? item.timestamp
                            : d.toLocaleString();
                        })()}
                      </div>
                      <div>
                        <strong>Question:</strong> {item.question}
                      </div>
                      {item.rewritten_question && (
                        <div>
                          <strong>Rewritten Question:</strong>{" "}
                          {item.rewritten_question}
                        </div>
                      )}
                      <div>
                        <strong>Answer:</strong> {item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
