const express = require("express");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
   getProductCount,
} = require("../models/Product");

const router = express.Router();

// ========================================
// GET ALL PRODUCTS
// ========================================
router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
});

// GET PRODUCT COUNT
router.get("/count", async (req, res) => {
  try {
    const count = await getProductCount();

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Get product count error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get product count.",
    });
  }
});

// ========================================
// GET SINGLE PRODUCT
// ========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
});

// ========================================
// CREATE PRODUCT
// ========================================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      banglaName,
      category,
      description,
      benefits,
      usage,
      supply,
      price,
      stock,
      image,
      badge,
      status,
    } = req.body;

    // Required field validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category and price are required.",
      });
    }

    const productData = {
      name: String(name).trim(),

      banglaName: banglaName
        ? String(banglaName).trim()
        : "",

      category: String(category).trim(),

      description: description
        ? String(description).trim()
        : "",

      benefits: Array.isArray(benefits)
        ? benefits
        : [],

      usage: Array.isArray(usage)
        ? usage
        : [],

      supply: Array.isArray(supply)
        ? supply
        : [],

      price: Number(price),

      stock: Number(stock || 0),

      image: image
        ? String(image).trim()
        : "",

      badge: badge
        ? String(badge).trim()
        : "",

      status: status || "active",

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    // Price validation
    if (
      Number.isNaN(productData.price) ||
      productData.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid positive number.",
      });
    }

    // Stock validation
    if (
      Number.isNaN(productData.stock) ||
      productData.stock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a valid positive number.",
      });
    }

    const product =
      await createProduct(productData);

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
});

// ========================================
// UPDATE PRODUCT
// ========================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check product exists
    const existingProduct =
      await getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      banglaName,
      category,
      description,
      benefits,
      usage,
      supply,
      price,
      stock,
      image,
      badge,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !category ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category and price are required.",
      });
    }

    const productData = {
      name: String(name).trim(),

      banglaName: banglaName
        ? String(banglaName).trim()
        : "",

      category: String(category).trim(),

      description: description
        ? String(description).trim()
        : "",

      benefits: Array.isArray(benefits)
        ? benefits
        : [],

      usage: Array.isArray(usage)
        ? usage
        : [],

      supply: Array.isArray(supply)
        ? supply
        : [],

      price: Number(price),

      stock: Number(stock || 0),

      image: image
        ? String(image).trim()
        : "",

      badge: badge
        ? String(badge).trim()
        : "",

      status: status || "active",
    };

    // Price validation
    if (
      Number.isNaN(productData.price) ||
      productData.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid positive number.",
      });
    }

    // Stock validation
    if (
      Number.isNaN(productData.stock) ||
      productData.stock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a valid positive number.",
      });
    }

    const updatedProduct =
      await updateProduct(
        id,
        productData
      );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Failed to update product.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
});

// ========================================
// DELETE PRODUCT
// ========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check product exists
    const existingProduct =
      await getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const result = await deleteProduct(id);

    if (!result || result.deletedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete product.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
});

module.exports = router;