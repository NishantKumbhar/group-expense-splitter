import Group from "../models/group.js";
import User from "../models/user.js";
import Expense from "../models/expense.js";
import Settlement from "../models/settlement.js";
import simplifyDebts from "../Utils/simplifyDebts.js";


const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Group name is required"
      });
    }

    const group = await Group.create({
      name: name,
      members: [req.userId],
      createdBy: req.userId
    });

    return res.status(201).json({
      message: "Group created successfully",
      group: group
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Member email is required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const alreadyMember = group.members.some(
      (memberId) =>
        memberId.toString() ===
        user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member"
      });
    }

    group.members.push(user._id);

    await group.save();

    await group.populate(
      "members",
      "name email"
    );

    return res.status(200).json({
      message: "Member added successfully",
      group: group
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const expenses = await Expense.find({
      group: groupId
    });

    const settlements = await Settlement.find({
      group: groupId
    });

    const balances = {};

    group.members.forEach((member) => {
      balances[member._id.toString()] = {
        userId: member._id,
        name: member.name,
        email: member.email,
        balance: 0
      };
    });

    expenses.forEach((expense) => {
      const payerId =
        expense.paidBy.toString();

      if (balances[payerId]) {
        balances[payerId].balance +=
          expense.amount;
      }

      expense.splits.forEach((split) => {
        const participantId =
          split.user.toString();

        if (balances[participantId]) {
          balances[participantId].balance -=
            split.amount;
        }
      });
    });

    settlements.forEach((settlement) => {
      const fromId =
        settlement.from.toString();

      const toId =
        settlement.to.toString();

      if (balances[fromId]) {
        balances[fromId].balance +=
          settlement.amount;
      }

      if (balances[toId]) {
        balances[toId].balance -=
          settlement.amount;
      }
    });

    const result =
      Object.values(balances);

    return res.status(200).json({
      groupName: group.name,
      balances: result
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const getSimplifiedDebts = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("members", "name email");

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const expenses = await Expense.find({
      group: groupId
    });

    const settlements = await Settlement.find({
      group: groupId
    });

    const balances = {};

    group.members.forEach((member) => {
      balances[member._id.toString()] = {
        userId: member._id,
        name: member.name,
        balance: 0
      };
    });

    expenses.forEach((expense) => {
      const payerId =
        expense.paidBy.toString();

      if (balances[payerId]) {
        balances[payerId].balance +=
          expense.amount;
      }

      expense.splits.forEach((split) => {
        const participantId =
          split.user.toString();

        if (balances[participantId]) {
          balances[participantId].balance -=
            split.amount;
        }
      });
    });

    settlements.forEach((settlement) => {
      const fromId =
        settlement.from.toString();

      const toId =
        settlement.to.toString();

      if (balances[fromId]) {
        balances[fromId].balance +=
          settlement.amount;
      }

      if (balances[toId]) {
        balances[toId].balance -=
          settlement.amount;
      }
    });

    const balanceList =
      Object.values(balances);

    const simplifiedDebts =
      simplifyDebts(balanceList);

    return res.status(200).json({
      groupName: group.name,
      simplifiedDebts: simplifiedDebts
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId
    }).populate(
      "members",
      "name email"
    );

    return res.status(200).json({
      groups: groups
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate(
        "members",
        "name email"
      );

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    return res.status(200).json({
      group: group
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


const getDashboardSummary = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.userId
    }).populate(
      "members",
      "name email"
    );

    let amountToPay = 0;
    let amountToReceive = 0;

    for (const group of groups) {

      const expenses = await Expense.find({
        group: group._id
      });

      const settlements =
        await Settlement.find({
          group: group._id
        });

      const balances = {};

      group.members.forEach((member) => {
        balances[
          member._id.toString()
        ] = 0;
      });

      expenses.forEach((expense) => {

        const payerId =
          expense.paidBy.toString();

        if (
          balances[payerId] !== undefined
        ) {
          balances[payerId] +=
            expense.amount;
        }

        expense.splits.forEach((split) => {

          const participantId =
            split.user.toString();

          if (
            balances[participantId] !==
            undefined
          ) {
            balances[participantId] -=
              split.amount;
          }

        });
      });

      settlements.forEach((settlement) => {

        const fromId =
          settlement.from.toString();

        const toId =
          settlement.to.toString();

        if (
          balances[fromId] !== undefined
        ) {
          balances[fromId] +=
            settlement.amount;
        }

        if (
          balances[toId] !== undefined
        ) {
          balances[toId] -=
            settlement.amount;
        }

      });

      const myBalance =
        balances[
          req.userId.toString()
        ] || 0;

      if (myBalance < 0) {
        amountToPay +=
          Math.abs(myBalance);
      }

      if (myBalance > 0) {
        amountToReceive +=
          myBalance;
      }
    }

    const netBalance =
      amountToReceive - amountToPay;

    return res.status(200).json({
      amountToPay: amountToPay,
      amountToReceive: amountToReceive,
      netBalance: netBalance
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


export {
  createGroup,
  addMember,
  getMyGroups,
  getGroupById,
  getGroupBalances,
  getSimplifiedDebts,
  getDashboardSummary
};