import Expense from "../models/expense.js";
import Group from "../models/group.js";

const addEqualExpense = async (req, res) => {
  try {
    const { groupId } = req.params;

    const {
      description,
      amount,
      paidBy,
      participants
    } = req.body;

    if (!description || !amount || !paidBy || !participants) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (participants.length === 0) {
      return res.status(400).json({
        message: "At least one participant is required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const shareAmount = amount / participants.length;

    const splits = participants.map((participantId) => {
      return {
        user: participantId,
        amount: shareAmount
      };
    });

    const expense = await Expense.create({
      group: groupId,
      description: description,
      amount: amount,
      paidBy: paidBy,
      participants: participants,
      splitType: "equal",
      splits: splits
    });

    return res.status(201).json({
      message: "Expense added successfully",
      expense: expense
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const addPercentageExpense = async (req, res) => {
  try {
    const { groupId } = req.params;

    const {
      description,
      amount,
      paidBy,
      percentageSplits
    } = req.body;

    if (!description || !amount || !paidBy || !percentageSplits) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (percentageSplits.length === 0) {
      return res.status(400).json({
        message: "At least one participant is required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    let totalPercentage = 0;

    percentageSplits.forEach((split) => {
      totalPercentage += split.percentage;
    });

    if (totalPercentage !== 100) {
      return res.status(400).json({
        message: "Total percentage must be 100"
      });
    }

    const participants = percentageSplits.map((split) => {
      return split.user;
    });

    const splits = percentageSplits.map((split) => {
      const shareAmount = (amount * split.percentage) / 100;

      return {
        user: split.user,
        amount: shareAmount
      };
    });

    const expense = await Expense.create({
      group: groupId,
      description: description,
      amount: amount,
      paidBy: paidBy,
      participants: participants,
      splitType: "percentage",
      splits: splits
    });

    return res.status(201).json({
      message: "Percentage expense added successfully",
      expense: expense
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const addCustomExpense = async (req, res) => {
  try {
    const { groupId } = req.params;

    const {
      description,
      amount,
      paidBy,
      customSplits
    } = req.body;

    if (!description || !amount || !paidBy || !customSplits) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (customSplits.length === 0) {
      return res.status(400).json({
        message: "At least one participant is required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    let totalCustomAmount = 0;

    customSplits.forEach((split) => {
      totalCustomAmount += split.amount;
    });

    if (totalCustomAmount !== amount) {
      return res.status(400).json({
        message: "Custom split amounts must equal the expense amount"
      });
    }

    const participants = customSplits.map((split) => {
      return split.user;
    });

    const splits = customSplits.map((split) => {
      return {
        user: split.user,
        amount: split.amount
      };
    });

    const expense = await Expense.create({
      group: groupId,
      description: description,
      amount: amount,
      paidBy: paidBy,
      participants: participants,
      splitType: "custom",
      splits: splits
    });

    return res.status(201).json({
      message: "Custom expense added successfully",
      expense: expense
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

export { addEqualExpense, addPercentageExpense,addCustomExpense };
