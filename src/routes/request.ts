import { Router, Request, Response } from "express"
import stockRequest from "../models/request"
import productModel from "../models/product"
import adjustmentModel from "../models/adjustment"

const router: Router = Router()

router.put("/approve", async (request: Request, response: Response) => {
    try {
        const { requestId, second_product, branch, updated_by, stock_before } = request.body

        // Find the stock request
        const stockRequestExist: any = await stockRequest
            .findOne({ _id: requestId, visible: true, status: { $eq: "pending" } })
            .lean({ autopopulate: true })

        if (!stockRequestExist)
            throw new Error("Request does not exist")

        const quantity = stockRequestExist.quantity

        // Update the second product
        const secondProductUpdated = await productModel.updateOne(
            {
                _id: second_product,
                branch,
                visible: true,
                stock: { $gte: quantity }
            },
            {
                $set: { updated_by },
                $inc: {
                    stock: (-1 * quantity),
                    quantity: (-1 * quantity)
                }
            },
            { new: true }
        )

        if (secondProductUpdated.modifiedCount !== 1)
            throw new Error("Failed to reduce product stock")

        // Create adjustment for the second product
        const secondProductAdjustementCreated = await adjustmentModel.create([
            {
                branch,
                user: updated_by,
                from: "request",
                type: "decrease",
                adjustment: quantity,
                created_by: updated_by,
                product: second_product,
                before_adjustment: stock_before,
                after_adjustment: stock_before - quantity,
                description: `Product stock was decreased because stock request was approved`,
            }
        ])

        if (!secondProductAdjustementCreated || secondProductAdjustementCreated.length === 0)
            throw new Error("Failed to create adjustment")

        // Update the first product
        const firstProductUpdated = await productModel.updateOne(
            {
                _id: stockRequestExist.product._id,
                visible: true,
            },
            {
                $set: { updated_by },
                $inc: {
                    quantity,
                    stock: quantity
                }
            },
            { new: true }
        )

        if (firstProductUpdated.modifiedCount !== 1)
            throw new Error("Failed to increase product stock")

        // Create adjustment for the first product
        const firstProductAdjustementCreated = await adjustmentModel.create([
            {
                user: updated_by,
                from: "request",
                type: "increase",
                adjustment: quantity,
                created_by: updated_by,
                branch: stockRequestExist.branch._id,
                product: stockRequestExist.product._id,
                before_adjustment: stockRequestExist.product.stock,
                after_adjustment: stockRequestExist.product.stock + quantity,
                description: `Product stock has been increased because stock request has been approved`,
            }
        ])

        if (!firstProductAdjustementCreated || firstProductAdjustementCreated.length === 0)
            throw new Error("Failed to create adjustment")

        // Update the stock request status
        const requestUpdated = await stockRequest.updateOne(
            { _id: requestId },
            {
                $set: {
                    updated_by,
                    second_product,
                    status: "approved",
                }
            }
        )

        if (requestUpdated.modifiedCount !== 1)
            throw new Error("Failed to update request status")

        return response.status(200).json({ success: true, message: "Request has been approved" })

    } catch (error) {
        return response.status(400).json({ success: false, message: (error as Error).message })
    }
})

export default router
