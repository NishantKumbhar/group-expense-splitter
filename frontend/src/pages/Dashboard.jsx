import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import "./Dashboard.css";

function Dashboard() {
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    amountToPay: 0,
    amountToReceive: 0,
    netBalance: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const profileResponse =
          await api.get("/auth/profile");

        setMessage(
          profileResponse.data.message
        );

        const groupsResponse =
          await api.get("/groups");

        setGroups(
          groupsResponse.data.groups
        );

        const summaryResponse =
          await api.get(
            "/groups/dashboard-summary"
          );

        setSummary(
          summaryResponse.data
        );

      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          "Unable to load dashboard"
        );

      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* Top Navigation */}
      <header className="dashboard-header">

        <div>
          <h2>
            SplitEase
          </h2>

          <span>
            Group Expense Splitter
          </span>
        </div>

        <div className="header-actions">

          <button className="profile-button">
            N
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-container">

        {/* Welcome Section */}
        <section className="welcome-section">

          <div>
            <p className="welcome-small">
              Welcome back
            </p>

            <h1>
              Manage your shared expenses
            </h1>

            <p>
              Create groups, split expenses
              and keep track of who needs to pay.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/groups/create")
            }
          >
            + Create Group
          </button>

        </section>

        {/* Summary Cards */}
        <section className="summary-grid">

          <div className="summary-card">

            <p>
              You Need to Pay
            </p>

            <h2>
              ₹{Number(
                summary.amountToPay || 0
              ).toFixed(2)}
            </h2>

            <span>
              Amount you need to pay others
            </span>

          </div>

          <div className="summary-card">

            <p>
              You Will Receive
            </p>

            <h2>
              ₹{Number(
                summary.amountToReceive || 0
              ).toFixed(2)}
            </h2>

            <span>
              Amount others need to pay you
            </span>

          </div>

          <div className="summary-card">

            <p>
              Net Balance
            </p>

            <h2>
              ₹{Number(
                summary.netBalance || 0
              ).toFixed(2)}
            </h2>

            <span>
              Your overall balance
            </span>

          </div>

        </section>

        {/* Main Dashboard Content */}
        <section className="dashboard-content">

          {/* Groups */}
          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Your Groups
                </h2>

                <p>
                  Recent shared expense groups
                </p>
              </div>

              <button className="secondary-button">
                View All
              </button>

            </div>

            <div className="group-list">

              {loading && (
                <p>
                  Loading groups...
                </p>
              )}

              {!loading &&
                groups.length === 0 && (
                  <div className="empty-group-card">
                    <p>
                      You haven't created
                      any groups yet.
                    </p>
                  </div>
                )}

              {!loading &&
                groups.map((group) => (
                  <div
                    className="group-card"
                    key={group._id}
                    onClick={() =>
                      navigate(
                        `/groups/${group._id}`
                      )
                    }
                  >

                    <div className="group-icon">
                      {group.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="group-info">

                      <h3>
                        {group.name}
                      </h3>

                      <p>
                        {group.members.length} members
                      </p>

                    </div>

                    <div className="group-balance">

                      <span>
                        View Group
                      </span>

                      <strong>
                        →
                      </strong>

                    </div>

                  </div>
                ))}

            </div>

          </div>

          {/* Quick Actions */}
          <aside className="dashboard-panel quick-actions">

            <div className="panel-header">

              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common tasks
                </p>
              </div>

            </div>

            <button
              className="action-button"
              onClick={() =>
                navigate("/groups/create")
              }
            >

              <div className="action-icon">
                +
              </div>

              <div>
                <strong>
                  Create Group
                </strong>

                <span>
                  Start a new expense group
                </span>
              </div>

            </button>

            <button className="action-button">

              <div className="action-icon">
                ₹
              </div>

              <div>
                <strong>
                  Add Expense
                </strong>

                <span>
                  Open a group to add an expense
                </span>
              </div>

            </button>

            <button className="action-button">

              <div className="action-icon">
                ✓
              </div>

              <div>
                <strong>
                  Settle Up
                </strong>

                <span>
                  Open a group to record a payment
                </span>
              </div>

            </button>

          </aside>

        </section>

        <p className="auth-status">
          {message}
        </p>

      </main>

    </div>
  );
}

export default Dashboard;