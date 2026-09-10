const express = require("express");

const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderCount,
  getTotalRevenue,
} = require("../models/Order");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   GET ORDER COUNT
   ADMIN ONLY
========================= */

router.get(
  "/count",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const count = await getOrderCount();

      return res.status(200).json({
        success: true,
        count,
      });
    } catch (error) {
      console.error(
        "Get order count error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get order count.",
      });
    }
  }
);

/* =========================
   GET TOTAL REVENUE
   ADMIN ONLY
========================= */

router.get(
  "/revenue",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const revenue = await getTotalRevenue();

      return res.status(200).json({
        success: true,
        revenue,
      });
    } catch (error) {
      console.error(
        "Get total revenue error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get total revenue.",
      });
    }
  }
);

/* =========================
   GET ALL ORDERS
   ADMIN ONLY
========================= */

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const orders = await getAllOrders();

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Get all orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get orders.",
      });
    }
  }
);

/* =========================
   GET SINGLE ORDER
   ADMIN ONLY
========================= */

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const order = await getOrderById(
        req.params.id
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "Get order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get order.",
      });
    }
  }
);

/* =========================
   CREATE ORDER
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
      paymentStatus,
      shippingAddress,
      notes,
    } = req.body;

    /* =========================
       BASIC VALIDATION
    ========================= */

    if (!customer?.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (!customer?.phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required.",
      });
    }

    if (!shippingAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (
      typeof total !== "number" ||
      total < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total.",
      });
    }

    const orderData = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || "",
      },

      items,

      subtotal:
        typeof subtotal === "number"
          ? subtotal
          : 0,

      deliveryCharge:
        typeof deliveryCharge === "number"
          ? deliveryCharge
          : 0,

      total,

      paymentMethod:
        paymentMethod || "cod",

      paymentStatus:
        paymentStatus || "pending",

      status: "pending",

      shippingAddress:
        shippingAddress.trim(),

      notes: notes?.trim() || "",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    const order = await createOrder(orderData);

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
    });
  }
});

/* =========================
   UPDATE ORDER STATUS
   ADMIN ONLY
========================= */

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status.",
        });
      }

      const updatedOrder =
        await updateOrderStatus(
          req.params.id,
          status
        );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status.",
      });
    }
  }
);

/* =========================
   DELETE ORDER
   ADMIN ONLY
========================= */

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const deletedOrder =
        await deleteOrder(req.params.id);

      if (!deletedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete order.",
      });
    }
  }
);

module.exports = router;