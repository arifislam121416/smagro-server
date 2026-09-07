const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

function productsCollection() {
  return getDB().collection("products");
}

async function getAllProducts() {
  return await productsCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

async function getProductCount() {
  return await productsCollection().countDocuments({});
}

async function getProductById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return await productsCollection().findOne({
    _id: new ObjectId(id),
  });
}

async function createProduct(productData) {
  const result =
    await productsCollection().insertOne(productData);

  return await productsCollection().findOne({
    _id: result.insertedId,
  });
}

async function updateProduct(id, productData) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result =
    await productsCollection().findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          ...productData,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

  return result;
}

async function deleteProduct(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const result = await productsCollection().deleteOne({
    _id: new ObjectId(id),
  });

  return result;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
};