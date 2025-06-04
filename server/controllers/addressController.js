import Address from "../models/Address.js";

// POST /api/address/add
export const addAddress = async (req, res) => {
  try {
    const userId = req.userId; // ✅ set by authUser
    const { address } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const newAddress = await Address.create({ ...address, userId });
    res.json({ success: true, message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Add Address Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.userId; // ✅ set by authUser

    const addresses = await Address.find({ userId });
    res.json({ success: true, address: addresses });
  } catch (error) {
    console.error("Get Address Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
