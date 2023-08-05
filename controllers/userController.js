import User from "../models/userModel.js";
import { capitalLetter, generateToken } from "../utils/helper.js";

export const registerUser = async (req, res) => {
  const { name, password, role, email } = req.body;
  try {
    if (!name || !password || !email || !role)
      return res.status(400).json({ msg: "Please provide required values" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "Email id already exists" });

    const user = await User.create({
      name: capitalLetter(name),
      email,
      password,
      role,
    });

    return res.status(201).send({ msg: `${user.name} is created` });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ msg: "Please provide required values" });

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      generateToken(res, user._id);

      return res.json({
        _id: user._id,
        name: user.name,
        role: user.role,
      });
    } else res.status(400).json({ msg: "Invalid credentials" });
  } catch (error) {
    console.log(error);
    res.send(500).json({ msg: "Server error, try again later" });
  }
};
