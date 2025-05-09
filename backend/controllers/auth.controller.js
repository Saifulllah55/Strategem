
console.log("Auth controller loaded");
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // compare passwords
    const isMatch = await bcryptjs.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // generate token & send response
    generateToken(existingUser._id, res);
    res.status(200).json({
      _id: existingUser._id,
      email: existingUser.email,
      username: existingUser.username,
      profilePic: existingUser.profilePic,
    });
  } catch (error) {
    console.error("Error in Login Controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signup = async (req, res) => {
  try {
    // defragmenting the request
    const { email, username, password, profilePic } = req.body;
    // making sure password is 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters." });
    }

    // making sure email is unique
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json("Email already exists.");
    }

    // hashing the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // creating new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      profilePic,
    });

    // returning jwt in case user is succesfully created
    if (newUser) {
      generateToken(newUser._id, res);

      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
        //can we simply put newUser here?
      });
    }
  } catch (error) {
    console.log("Error in SignUp Controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // clearing the web token from cookies
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in Logout Controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  }catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
