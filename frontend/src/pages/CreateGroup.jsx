import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";
import "./Form.css";

function CreateGroup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a group name");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/groups", {
        name: name
      });

      const groupId = response.data.group._id;

      navigate(`/groups/${groupId}`);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to create group"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">

      <div className="form-card">

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>Create Group</h1>

        <p>
          Create a group to start sharing expenses.
        </p>

        <form onSubmit={handleCreateGroup}>

          <label>
            Group Name
          </label>

          <input
            type="text"
            placeholder="Example: Goa Trip"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Group"}
          </button>

        </form>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default CreateGroup;