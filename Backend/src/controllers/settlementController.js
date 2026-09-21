import Settlement from "../models/settlement.js";
import Group from "../models/group.js";

const createSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;

    const {
      from,
      to,
      amount
    } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (from === to) {
      return res.status(400).json({
        message: "From and To users cannot be the same"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const settlement = await Settlement.create({
      group: groupId,
      from: from,
      to: to,
      amount: amount
    });

    return res.status(201).json({
      message: "Settlement recorded successfully",
      settlement: settlement
    });

  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

export { createSettlement };