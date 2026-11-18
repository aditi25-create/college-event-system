import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeId, department } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error("Please provide name, email, and password"));
    }

    if (password.length < 6) {
      res.status(400);
      return next(new Error("Password must be at least 6 characters"));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error("User with this email already exists"));
    }

    // Safeguard: only allow 'student' or 'organizer' on self-registration
    const assignedRole = role === "organizer" ? "organizer" : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      collegeId: collegeId || "",
      department: department || "",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error("Please provide both email and password"));
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        department: user.department,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
