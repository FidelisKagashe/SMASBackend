// Import required dependencies and modules
import { controllers } from "bapig"
import { purchase } from "../interface"
import { commonSchemaValues } from "../database/schema"
import {
  accountSelection,
  productPopulation
} from "../database/population"
import {
  createActivity,
  schemaMiddlewareEvents,
  activitySentence,
} from "../helpers"

import { mongoose } from "bapig"
const { Schema, model } = mongoose

// Define the schema for the purchase
const schema = new Schema<purchase>(
  {
    // Define the 'total_amount' field with indexing and required attribute
    total_amount: {
      type: Number,
      index: true,
      required: true
    },
    // Define the 'paid_amount' field with indexing and default value
    paid_amount: {
      type: Number,
      index: true,
      default: 0
    },
    // Define the 'product' field with indexing, required attribute, and autopopulate
    product: {
      type: Schema.Types.ObjectId,
      index: true,
      required: true,
      ref: 'product',
      autopopulate: { maxDepth: 1, select: productPopulation }
    },
    // Define the 'supplier' field with indexing, default value, ref, and autopopulate
    supplier: {
      index: true,
      default: null,
      ref: 'supplier',
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: { name: 1, phone_number: 1 } }
    },
    // Define the 'number' field with indexing and default value
    number: {
      index: true,
      type: String,
      default: null
    },
    // Define the 'quantity' field with indexing and required attribute
    quantity: {
      index: true,
      type: Number,
      required: true
    },
    // Define the 'buying_price' field with default value and indexing
    buying_price: {
      type: Number,
      default: 0,
      index: true
    },
    // Define the 'selling_price' field with default value and indexing
    selling_price: {
      type: Number,
      default: 0,
      index: true
    },
    // Define the 'reorder_stock_level' field with default value and indexing
    reorder_stock_level: {
      type: Number,
      default: 0,
      index: true
    },
    // Define the 'date' field with indexing and required attribute
    date: {
      index: true,
      type: Date,
      required: true
    },
    // Define the 'stock_after' field with indexing and default value
    stock_after: {
      index: true,
      type: Number,
      default: null
    },
    // Define the 'stock_before' field with indexing and default value
    stock_before: {
      index: true,
      type: Number,
      default: null
    },
    // Define the 'use_supplier_account' field with indexing and default value
    use_supplier_account: {
      type: Boolean,
      index: true,
      default: false
    },
    // Define the 'account' field with indexing, default value, ref, and autopopulate
    account: {
      type: Schema.Types.ObjectId,
      index: true,
      default: null,
      ref: 'account',
      autopopulate: { maxDepth: 1, select: accountSelection }
    },
    // Define the 'fee' field with default value and indexing
    fee: {
      index: true,
      type: Number,
      default: 0
    },
    // Define the 'for_store_product' field with indexing and default value
    for_store_product: {
      index: true,
      type: Boolean,
      default: false
    },
    // Define the 'store' field with indexing and ref
    store: {
      index: true,
      ref: 'store',
      default: null,
      type: Schema.Types.ObjectId
    },
    // Define the 'editable' field with indexing and default value
    editable: {
      index: true,
      type: Boolean,
      default: true
    },
    // Define the 'reference' field with indexing and default value
    reference: {
      index: true,
      type: String,
      default: null
    },

    category: {
      index: true,
      default: null,
      ref: 'category',
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1, select: "name" }
    },

    // Include common schema values
    ...commonSchemaValues
  },
  { timestamps: true }
)

// Indexes for timestamps
schema.index({ createdAt: -1 }, { background: true })
schema.index({ updatedAt: -1 }, { background: true })

// Add Mongoose autopopulate plugin
schema.plugin(require('mongoose-autopopulate'))

// Middleware before creating
schema.pre(schemaMiddlewareEvents.create, async function (next) {
  try {
    const purchase: any = this

    if (purchase.use_supplier_account) {
      const account = await controllers.getSingleDocument({
        schema: "account",
        select: { balance: 1 },
        joinForeignKeys: false,
        condition: { type: "supplier", supplier: purchase.supplier }
      })

      if (account.success) {
        purchase.account = account.message._id
        next()
      } else {
        return next(new Error("supplier account does not exist"))
      }
    } else {
      next()
    }
  } catch (error) {
    return next(new Error((error as Error).message))
  }
})

// Middleware for delete
schema.post(schemaMiddlewareEvents.delete, function (purchase: any) {
  try {
    if (purchase) {
      // Create activity for purchase deletion
      createActivity({
        data: purchase,
        type: "deletion",
        module: "purchase",
        branch: purchase.branch,
        user: purchase.updated_by,
        description: activitySentence("delete")
      })
    }
  } catch (error) {
    console.log("Purchase Schema Middleware (delete) Error: ", (error as Error).message)
  }
})

// Create the Mongoose model for purchase
const purchaseModel = model<purchase>('purchase', schema)

// Export the purchase model
export default purchaseModel