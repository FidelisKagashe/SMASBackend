// Import required dependencies and modules
import { sale } from "../interface"
import { commonSchemaValues } from "../database/schema"
import {
  accountSelection,
  customerPopulation,
  productPopulation,
} from "../database/population"
import { mongoose } from "bapig"
const { Schema, model } = mongoose

// Define the schema for the "sale" collection
const schema = new Schema<sale>(
  {

    number: {
      type: String,
      index: true,
      required: false,
    },

    // Define the 'customer' field with indexing, default value, and reference to 'customer' collection
    customer: {
      index: true,
      default: null,
      ref: "customer",
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: customerPopulation },
    },
    // Define the 'product' field with indexing, required attribute, and reference to 'product' collection
    product: {
      index: true,
      default: null,
      ref: "product",
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: productPopulation },
    },
    // Define the 'total_amount' field with indexing and required attribute
    total_amount: {
      index: true,
      type: Number,
      required: true,
    },
    // Define the 'discount' field with indexing and default value
    discount: {
      index: true,
      type: Number,
      default: 0,
    },
    // Define the 'quantity' field with indexing and required attribute
    quantity: {
      index: true,
      type: Number,
      required: true,
    },
    // Define the 'status' field with indexing and required attribute
    status: {
      index: true,
      type: String,
      required: true,
    },
    // Define the 'type' field with indexing and default value
    type: {
      index: true,
      type: String,
      default: "cart",
    },
    // Define the 'profit' field with indexing and required attribute
    profit: {
      index: true,
      type: Number,
      required: true,
    },
    // Define the 'stock_after' field with indexing and default value
    stock_after: {
      index: true,
      type: Number,
      default: null,
    },
    // Define the 'stock_before' field with indexing and default value
    stock_before: {
      index: true,
      type: Number,
      default: null,
    },
    // Define the 'use_customer_account' field with indexing and default value
    use_customer_account: {
      index: true,
      type: Boolean,
      default: false,
    },
    // Define the 'account' field with indexing, default value, and reference to 'account' collection
    account: {
      index: true,
      default: null,
      ref: "account",
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: accountSelection },
    },

    category: {
      index: true,
      default: null,
      ref: 'category',
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: "name" }
    },

    reference: {
      index: true,
      type: String,
      default: null,
    },

    tra_printed: {
      type: Boolean,
      default: false
    },

    fake: {
      type: Boolean,
      default: false
    },

    // Include common schema values
    ...commonSchemaValues,
  },
  { timestamps: true }
)

// Indexes for timestamps
schema.index({ createdAt: -1 }, { background: true })
schema.index({ updatedAt: -1 }, { background: true })

// Add Mongoose autopopulate plugin
schema.plugin(require("mongoose-autopopulate"))

// Create the Mongoose model for "sale"
const saleModel = model<sale>("sale", schema)

// Export the "sale" model
export default saleModel