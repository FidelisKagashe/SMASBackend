// Import required dependencies and modules
import { commonInterface } from "../interface"
import { commonSchemaValues } from "../database/schema"
import { mongoose } from "bapig"
const { Schema, model } = mongoose

// Define the schema for the product
const schema = new Schema<commonInterface>(
  {
    // Define the 'name' field with indexing and default value
    name: {
      index: true,
      type: String,
      default: null
    },

    // Define the 'buying_price' field with indexing and required attribute
    buying_price: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'selling_price' field with indexing and required attribute
    selling_price: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'stock' field with indexing and required attribute
    stock: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'reorder_stock_level' field with indexing and required attribute
    reorder_stock_level: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'quantity' field with indexing and required attribute
    quantity: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'barcode' field with indexing and default value
    barcode: {
      index: true,
      type: String,
      default: null
    },
    // Define the 'is_store_product' field with indexing and default value
    is_store_product: {
      index: true,
      type: Boolean,
      default: false
    },

    // Define the 'store' field with indexing, ref, and autopopulate
    store: {
      index: true,
      ref: 'store',
      default: null,
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: "name" }
    },

    category: {
      index: true,
      default: null,
      ref: 'category',
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: "name" }
    },

    position: {
      type: String,
      default: null
    },

    code: {
      index: true,
      type: String,
      default: null
    },

    cif: {
      type: Number,
      default: null
    },

    // Include common schema values
    ...commonSchemaValues
  },
  { timestamps: true }
);

// Indexes for timestamps
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

// Add Mongoose autopopulate plugin
schema.plugin(require('mongoose-autopopulate'));

// Create the Mongoose model for product
const productModel = model<commonInterface>('product', schema);

// Export the product model
export default productModel;