import { mongoose } from "bapig"
import { stockRequest } from "../interface"
import { commonSchemaValues } from "../database/schema"
import mongooseAutoPopulate from "mongoose-autopopulate"
import { branchPopulation, productPopulation } from "../database/population"

const { Schema, model } = mongoose

const requestSchema = new Schema<stockRequest>(
    {

        second_branch: {
            type: Schema.Types.ObjectId,
            ref: "branch",
            index: true,
            autopopulate: { maxDepth: 1, select: branchPopulation },
            default: null,
        },

        second_product: {
            type: Schema.Types.ObjectId,
            ref: "product",
            index: true,
            autopopulate: { maxDepth: 1, select: productPopulation },
            default: null,
        },

        second_store: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "branch",
            autopopulate: { maxDepth: 1, select: branchPopulation },
            default: null,
        },

        product: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "product",
            autopopulate: { maxDepth: 1, select: productPopulation },
            required: true,
        },

        status: {
            type: String,
            index: true,
            default: "pending"
        },

        quantity: {
            type: Number,
            index: true,
            required: true,
        },

        ...commonSchemaValues

    },
    { timestamps: true }
)

requestSchema.index({ createdAt: -1 }, { background: true })
requestSchema.index({ updatedAt: -1 }, { background: true })

requestSchema.plugin(mongooseAutoPopulate)

const stockRequest = model<stockRequest>("stock_request", requestSchema)

export default stockRequest