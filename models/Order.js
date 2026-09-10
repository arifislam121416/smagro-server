const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

function ordersCollection() {
  return getDB().collection("orders");
}

/* =========================
   GET ALL ORDERS
========================= */

async function getAllOrders() {
  return await ordersCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

/* =========================
   GET ORDER BY ID
========================= */

async function getOrderById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return await ordersCollection().findOne({
    _id: new ObjectId(id),
  });
}

/* =========================
   CREATE ORDER
========================= */

async function createOrder(orderData) {
  const result = await ordersCollection().insertOne(
    orderData
  );

  return await ordersCollection().findOne({
    _id: result.insertedId,
  });
}

/* =========================
   UPDATE ORDER STATUS
========================= */

async function updateOrderStatus(id, status) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result =
    await ordersCollection().findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

  return result;
}

/* =========================
   DELETE ORDER
========================= */

async function deleteOrder(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await ordersCollection().deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    return null;
  }

  return result;
}

/* =========================
   GET ORDER COUNT
========================= */

async function getOrderCount() {
  return await ordersCollection().countDocuments({});
}

/* =========================
   GET TOTAL REVENUE
========================= */

async function getTotalRevenue() {
  const result = await ordersCollection()
    .aggregate([
      {
        $match: {
          status: {
            $ne: "cancelled",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
        },
      },
    ])
    .toArray();

  return result.length > 0
    ? result[0].totalRevenue
    : 0;
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderCount,
  getTotalRevenue,
};