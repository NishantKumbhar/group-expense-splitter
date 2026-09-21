import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../api/api.js";
import "./GroupDetails.css";

function GroupDetails() {
  const { groupId } = useParams();

  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);

  const [memberEmail, setMemberEmail] = useState("");
  const [memberMessage, setMemberMessage] = useState("");

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const groupResponse =
          await api.get(`/groups/${groupId}`);

        const balanceResponse =
          await api.get(
            `/groups/${groupId}/balances`
          );

        const simplifiedResponse =
          await api.get(
            `/groups/${groupId}/simplified-debts`
          );

        setGroup(
          groupResponse.data.group
        );

        setBalances(
          balanceResponse.data.balances
        );

        setSimplifiedDebts(
          simplifiedResponse.data.simplifiedDebts
        );

      } catch (error) {
        console.log(error);
      }
    };

    loadGroup();

  }, [groupId]);

  const handleAddMember = async (event) => {
    event.preventDefault();

    setMemberMessage("");

    if (!memberEmail.trim()) {
      setMemberMessage(
        "Please enter member email"
      );

      return;
    }

    try {
      const response = await api.post(
        `/groups/${groupId}/members`,
        {
          email: memberEmail
        }
      );

      setGroup(
        response.data.group
      );

      setMemberEmail("");

      setMemberMessage(
        "Member added successfully"
      );

    } catch (error) {
      setMemberMessage(
        error.response?.data?.message ||
        "Unable to add member"
      );
    }
  };

  if (!group) {
    return (
      <div className="group-loading">
        Loading group...
      </div>
    );
  }

  return (
    <div className="group-details-page">

      <header className="group-details-header">

        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <h1>
            {group.name}
          </h1>

          <p>
            {group.members.length} members
          </p>
        </div>

        <div className="group-action-buttons">

          <button
            className="primary-action-button"
            onClick={() =>
              navigate(
                `/groups/${groupId}/add-expense`
              )
            }
          >
            + Add Expense
          </button>

          <button
            className="secondary-action-button"
            onClick={() =>
              navigate(
                `/groups/${groupId}/settlement`
              )
            }
          >
            Settle Up
          </button>

        </div>

      </header>

      <main className="group-details-container">

        <section className="group-grid">

          {/* Add Member */}

          <div className="group-section-card">

            <div className="section-heading">
              <div>
                <h2>
                  Add Member
                </h2>

                <p>
                  Add a registered user to this group
                </p>
              </div>
            </div>

            <form
              className="add-member-form"
              onSubmit={handleAddMember}
            >

              <input
                type="email"
                placeholder="Enter member email"
                value={memberEmail}
                onChange={(event) =>
                  setMemberEmail(
                    event.target.value
                  )
                }
              />

              <button type="submit">
                Add Member
              </button>

            </form>

            {memberMessage && (
              <p className="member-message">
                {memberMessage}
              </p>
            )}

          </div>

          {/* Members */}

          <div className="group-section-card">

            <div className="section-heading">
              <div>
                <h2>
                  Members
                </h2>

                <p>
                  People in this group
                </p>
              </div>

              <span className="member-count">
                {group.members.length}
              </span>
            </div>

            <div className="members-list">

              {group.members.map((member) => (
                <div
                  className="member-item"
                  key={member._id}
                >

                  <div className="member-avatar">
                    {member.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="member-details">
                    <strong>
                      {member.name}
                    </strong>

                    <span>
                      {member.email}
                    </span>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* Balances */}

        <section className="group-section-card balances-section">

          <div className="section-heading">
            <div>
              <h2>
                Balances
              </h2>

              <p>
                Current balance of each member
              </p>
            </div>
          </div>

          <div className="balances-list">

            {balances.map((person) => {

              let balanceClass = "balance-settled";
              let balanceText = "Settled";

              if (person.balance > 0) {
                balanceClass = "balance-positive";
                balanceText =
                  `Receive ₹${Number(
                    person.balance
                  ).toFixed(2)}`;
              }

              if (person.balance < 0) {
                balanceClass = "balance-negative";
                balanceText =
                  `Pay ₹${Math.abs(
                    Number(person.balance)
                  ).toFixed(2)}`;
              }

              return (
                <div
                  className="balance-item"
                  key={person.userId}
                >

                  <div>
                    <strong>
                      {person.name}
                    </strong>

                    <span>
                      {person.email}
                    </span>
                  </div>

                  <div
                    className={`balance-badge ${balanceClass}`}
                  >
                    {balanceText}
                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* Suggested Settlements */}

        <section className="group-section-card">

          <div className="section-heading">
            <div>
              <h2>
                Suggested Settlements
              </h2>

              <p>
                Simplified payments to settle the group
              </p>
            </div>
          </div>

          {simplifiedDebts.length === 0 ? (

            <div className="settled-empty-state">
              <strong>
                Everyone is settled
              </strong>

              <p>
                No payments are currently required.
              </p>
            </div>

          ) : (

            <div className="settlement-list">

              {simplifiedDebts.map(
                (debt, index) => (
                  <div
                    className="settlement-item"
                    key={index}
                  >

                    <div className="settlement-flow">

                      <strong>
                        {debt.fromName}
                      </strong>

                      <span className="settlement-arrow">
                        →
                      </span>

                      <strong>
                        {debt.toName}
                      </strong>

                    </div>

                    <div className="settlement-amount">
                      ₹{Number(
                        debt.amount
                      ).toFixed(2)}
                    </div>

                  </div>
                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default GroupDetails;