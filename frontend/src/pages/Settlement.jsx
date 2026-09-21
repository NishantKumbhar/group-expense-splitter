import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../api/api.js";
import "./Form.css";

function Settlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const response =
          await api.get(`/groups/${groupId}`);

        setGroup(
          response.data.group
        );

      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          "Unable to load group"
        );
      }
    };

    loadGroup();

  }, [groupId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!from || !to || !amount) {
      setMessage(
        "Please fill all fields"
      );

      return;
    }

    if (from === to) {
      setMessage(
        "Payer and receiver cannot be the same person"
      );

      return;
    }

    if (Number(amount) <= 0) {
      setMessage(
        "Amount must be greater than 0"
      );

      return;
    }

    try {
      setLoading(true);

      await api.post(
        `/groups/${groupId}/settlements`,
        {
          from: from,
          to: to,
          amount: Number(amount)
        }
      );

      navigate(`/groups/${groupId}`);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to record settlement"
      );

    } finally {
      setLoading(false);
    }
  };

  if (!group) {
    return (
      <div className="form-page">
        <div className="form-card">
          <p>
            Loading group...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">

      <div className="form-card">

        <button
          type="button"
          className="form-back-button"
          onClick={() =>
            navigate(`/groups/${groupId}`)
          }
        >
          ← Back to Group
        </button>

        <h1>
          Settle Up
        </h1>

        <p>
          Record a payment in{" "}
          <strong>{group.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Who Paid?
          </label>

          <select
            value={from}
            onChange={(event) =>
              setFrom(event.target.value)
            }
          >
            <option value="">
              Select member
            </option>

            {group.members.map((member) => (
              <option
                key={member._id}
                value={member._id}
              >
                {member.name}
              </option>
            ))}
          </select>

          <label>
            Paid To
          </label>

          <select
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
          >
            <option value="">
              Select member
            </option>

            {group.members.map((member) => (
              <option
                key={member._id}
                value={member._id}
              >
                {member.name}
              </option>
            ))}
          </select>

          <label>
            Amount
          </label>

          <input
            type="number"
            min="1"
            placeholder="Example: 500"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Recording..."
              : "Record Settlement"}
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

export default Settlement;