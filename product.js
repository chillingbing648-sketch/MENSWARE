const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    size: {
      type: String,
      trim: true,
      default: null,
    },

    color: {
      type: String,
      trim: true,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "MENSWARE",
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});

module.exports = mongoose.model("Product", productSchema);
