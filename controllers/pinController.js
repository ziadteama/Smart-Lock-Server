// controllers/pinController.js

export const setPin = async (req, res) => {
    const { userId, pin } = req.body;
    res.status(200).json({ message: "PIN set successfully" });
  };
  
  export const verifyPin = async (req, res) => {
    const { userId, pin } = req.body;
    res.status(200).json({ verified: true });
  };
  
  export const updatePin = async (req, res) => {
    const { userId, newPin } = req.body;
    res.status(200).json({ message: "PIN updated" });
  };
  
  export const deletePin = async (req, res) => {
    const { userId } = req.body;
    res.status(200).json({ message: "PIN deleted" });
  };
  