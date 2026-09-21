import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../api/api.js";
import "./Form.css";

function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [splitType, setSplitType] = useState("equal");

  const [participants, setParticipants] = useState([]);
  const [percentages, setPercentages] = useState({});
  const [customAmounts, setCustomAmounts] = useState({});

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

  const handleParticipantChange = (userId) => {
    if (participants.includes(userId)) {
      setParticipants(
        participants.filter(
          (id) => id !== userId
        )
      );

    } else {
      setParticipants([
        ...participants,
        userId
      ]);
    }
  };

  const handlePercentageChange = (
    userId,
    value
  ) => {
    setPercentages({
      ...percentages,
      [userId]: value
    });
  };

  const handleCustomAmountChange = (
    userId,
    value
  ) => {
    setCustomAmounts({
      ...customAmounts,
      [userId]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (
      !description.trim() ||
      !amount ||
      !paidBy
    ) {
      setMessage(
        "Please fill all required fields"
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

      // Equal Split
      if (splitType === "equal") {

        if (participants.length === 0) {
          setMessage(
            "Please select at least one participant"
          );

          return;
        }

        await api.post(
          `/groups/${groupId}/expenses`,
          {
            description: description,
            amount: Number(amount),
            paidBy: paidBy,
            participants: participants
          }
        );
      }

      // Percentage Split
      if (splitType === "percentage") {

        const percentageSplits =
          group.members.map((member) => ({
            user: member._id,

            percentage: Number(
              percentages[member._id] || 0
            )
          }));

        const totalPercentage =
          percentageSplits.reduce(
            (total, split) =>
              total + split.percentage,
            0
          );

        if (totalPercentage !== 100) {
          setMessage(
            "Total percentage must equal 100%"
          );

          return;
        }

        await api.post(
          `/groups/${groupId}/expenses/percentage`,
          {
            description: description,
            amount: Number(amount),
            paidBy: paidBy,
            percentageSplits: percentageSplits
          }
        );
      }

      // Custom Split
      if (splitType === "custom") {

        const customSplits =
          group.members.map((member) => ({
            user: member._id,

            amount: Number(
              customAmounts[member._id] || 0
            )
          }));

        const totalCustomAmount =
          customSplits.reduce(
            (total, split) =>
              total + split.amount,
            0
          );

        if (
          totalCustomAmount !==
          Number(amount)
        ) {
          setMessage(
            "Custom split total must equal expense amount"
          );

          return;
        }

        await api.post(
          `/groups/${groupId}/expenses/custom`,
          {
            description: description,
            amount: Number(amount),
            paidBy: paidBy,
            customSplits: customSplits
          }
        );
      }

      navigate(`/groups/${groupId}`);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to add expense"
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
          Add Expense
        </h1>

        <p>
          Add an expense to{" "}
          <strong>{group.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Description
          </label>

          <input
            type="text"
            placeholder="Example: Dinner"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />

          <label>
            Amount
          </label>

          <input
            type="number"
            min="1"
            placeholder="Example: 1000"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
          />

          <label>
            Paid By
          </label>

          <select
            value={paidBy}
            onChange={(event) =>
              setPaidBy(
                event.target.value
              )
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
            Split Type
          </label>

          <select
            value={splitType}
            onChange={(event) =>
              setSplitType(
                event.target.value
              )
            }
          >

            <option value="equal">
              Equal Split
            </option>

            <option value="percentage">
              Percentage Split
            </option>

            <option value="custom">
              Custom Split
            </option>

          </select>

          {/* Equal Split */}

          {splitType === "equal" && (
            <>
              <label>
                Split Between
              </label>

              <div className="participant-list">

                {group.members.map((member) => (
                  <label
                    key={member._id}
                    className="participant-item"
                  >

                    <input
                      type="checkbox"
                      checked={
                        participants.includes(
                          member._id
                        )
                      }
                      onChange={() =>
                        handleParticipantChange(
                          member._id
                        )
                      }
                    />

                    <span>
                      {member.name}
                    </span>

                  </label>
                ))}

              </div>
            </>
          )}

          {/* Percentage Split */}

          {splitType === "percentage" && (
            <>
              <label>
                Percentage Split
              </label>

              <div className="percentage-list">

                {group.members.map((member) => (
                  <div
                    key={member._id}
                    className="percentage-item"
                  >

                    <span>
                      {member.name}
                    </span>

                    <div className="percentage-input">

                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={
                          percentages[
                            member._id
                          ] || ""
                        }
                        onChange={(event) =>
                          handlePercentageChange(
                            member._id,
                            event.target.value
                          )
                        }
                      />

                      <span>
                        %
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

          {/* Custom Split */}

          {splitType === "custom" && (
            <>
              <label>
                Custom Split
              </label>

              <div className="percentage-list">

                {group.members.map((member) => (
                  <div
                    key={member._id}
                    className="percentage-item"
                  >

                    <span>
                      {member.name}
                    </span>

                    <div className="percentage-input">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={
                          customAmounts[
                            member._id
                          ] || ""
                        }
                        onChange={(event) =>
                          handleCustomAmountChange(
                            member._id,
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>
                ))}

              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Adding Expense..."
              : "Add Expense"}
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

export default AddExpense;