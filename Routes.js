const express = require("express");
const crypto = require("crypto");
const Order = require("./models/Order");
const Product = require("./models/Product");
const {
  authenticate,
  requireAdmin,
} = require("./middleware/auth");

const router = express.Router();

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `MW-${timestamp}-${random}`;
}

/*
 * POST /api/orders
 * Create order
 *
 * IMPORTANT:
 * Client sends product IDs + quantities.
 * Server calculates prices.
 */
router.post("/", async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      items,
      shippingAddress,
      paymentMethod = "cod",
    } = req.body;

    if (
      !name ||
      !email ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer and order items are required",
      });
    }

    if (!shippingAddress?.addressLine1 ||
        !shippingAddress?.city ||
        !shippingAddress?.state ||
        !shippingAddress?.postalCode) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    const orderItems = [];
    let subtotal = 0;

    for (const requestedItem of items) {
      const product = productMap.get(
        requestedItem.productId
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products no longer exist",
        });
      }

      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      let variant = null;

      if (requestedItem.variantId) {
        variant = product.variants.id(
          requestedItem.variantId
        );

        if (!variant || !variant.isActive) {
          return res.status(400).json({
            success: false,
            message: `Invalid variant for ${product.name}`,
          });
        }

        if (variant.stock < quantity) {
          return res.status(409).json({
            success: false,
            message: `${product.name} is out of stock`,
          });
        }
      }

      const unitPrice = variant
        ? variant.price
        : product.basePrice;

      const totalPrice = unitPrice * quantity;

      subtotal += totalPrice;

      orderItems.push({
        productId: product._id,
        variantId: variant?._id || null,
        name: product.name,
        sku: variant?.sku || null,
        image: product.images?.[0] || null,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    const shippingFee = subtotal >= 2000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + shippingFee + tax;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      user: req.user?._id || null,

      customer: {
        name,
        email,
        phone: phone || null,
      },

      items: orderItems,

      shippingAddress,

      subtotal,
      shippingFee,
      tax,
      total,

      payment: {
        method: paymentMethod,
        status:
          paymentMethod === "cod"
            ? "pending"
            : "processing",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        tax: order.tax,
        total: order.total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/*
 * GET /api/orders/my
 */
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * GET /api/orders/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * GET /api/orders/admin/all
 */
router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * PATCH /api/orders/admin/:id/status
 */
router.patch(
  "/admin/:id/status",
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      const { status } = req.body;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        order,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
