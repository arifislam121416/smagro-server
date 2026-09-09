const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const usersCollection = () => {
  return getDB().collection("users");
};

/* =========================
   FIND USER BY EMAIL
========================= */

async function findUserByEmail(email) {
  return await usersCollection().findOne({
    email: email.toLowerCase(),
  });
}

/* =========================
   FIND USER BY ID
========================= */

async function findUserById(id) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await usersCollection().findOne({
      _id: new ObjectId(id),
    });
  } catch (error) {
    console.error("Find user by ID error:", error);
    return null;
  }
}

/* =========================
   CREATE USER
========================= */

async function createUser(userData) {
  const result = await usersCollection().insertOne(userData);

  return {
    ...userData,
    _id: result.insertedId,
  };
}

/* =========================
   GET ALL USERS
========================= */

async function getAllUsers() {
  return await usersCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

/* =========================
   UPDATE USER ROLE
========================= */

async function updateUserRole(id, role) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await usersCollection().findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        role,
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
   UPDATE USER STATUS
========================= */

async function updateUserStatus(id, status) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await usersCollection().findOneAndUpdate(
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

async function deleteUser(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await usersCollection().deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 0) {
    return null;
  }

  return result;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};