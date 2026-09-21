const simplifyDebts = (balances) => {
  const debtors = [];
  const creditors = [];

  balances.forEach((person) => {
    if (person.balance < 0) {
      debtors.push({
        userId: person.userId,
        name: person.name,
        amount: Math.abs(person.balance)
      });
    }

    if (person.balance > 0) {
      creditors.push({
        userId: person.userId,
        name: person.name,
        amount: person.balance
      });
    }
  });

  const settlements = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const paymentAmount = Math.min(
      debtor.amount,
      creditor.amount
    );

    settlements.push({
      from: debtor.userId,
      fromName: debtor.name,
      to: creditor.userId,
      toName: creditor.name,
      amount: paymentAmount
    });

    debtor.amount -= paymentAmount;
    creditor.amount -= paymentAmount;

    if (debtor.amount === 0) {
      debtorIndex++;
    }

    if (creditor.amount === 0) {
      creditorIndex++;
    }
  }

  return settlements;
};

export default simplifyDebts;