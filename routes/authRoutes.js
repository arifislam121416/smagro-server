const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../models/User");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   TEST LOGIN ROUTE
========================= */

router.get("/login", (req, res) => {
  res.json({
    success: true,
    message:
      "Login route is working. Use POST request for actual login.",
  });
});

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      profileImage,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required.",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address.",
      });
    }

    if (phone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid phone number.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser =
      await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      profileImage: profileImage || "",
      role: "user",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user =
      await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled.",
      });
    }

    const passwordMatched =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.cookie("smagro_token", token, {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,

      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

/* =========================
   CURRENT USER
========================= */

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await findUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

/* =========================
   ADMIN TEST
========================= */

router.get(
  "/admin-test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted.",
      user: req.user,
    });
  }
);

/* =========================
   GET ALL USERS
   ADMIN ONLY
========================= */

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await getAllUsers();

      const safeUsers = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        users: safeUsers,
      });
    } catch (error) {
      console.error(
        "Get users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

/* =========================
   UPDATE USER ROLE
   ADMIN ONLY
========================= */

router.patch(
  "/users/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be either user or admin.",
        });
      }

      const updatedUser =
        await updateUserRole(
          req.params.id,
          role
        );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User role updated successfully.",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      });
    } catch (error) {
      console.error(
        "Update role error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

/* =========================
   UPDATE USER STATUS
   ADMIN ONLY
========================= */

router.patch(
  "/users/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (
        !status ||
        !["active", "blocked"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be active or blocked.",
        });
      }

      const updatedUser =
        await updateUserStatus(
          req.params.id,
          status
        );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User status updated successfully.",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      });
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);


/* =========================
   DELETE USER
   ADMIN ONLY
========================= */

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const deletedUser = await deleteUser(
        req.params.id
      );

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

/* =========================
   LOGOUT
========================= */

router.post(
  "/logout",
  (req, res) => {
    res.clearCookie(
      "smagro_token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite:
          process.env.NODE_ENV === "production"
            ? "none"
            : "lax",

        path: "/",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  }
);

module.exports = router;