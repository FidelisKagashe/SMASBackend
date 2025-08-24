import saleModel from "../models/sale"
import orderModel from "../models/order"
import { array, string } from "fast-web-kit"
import { controllers, mongoose } from "bapig"
import { Router, Request, Response } from "express"
import * as saleController from "../controllers/sale"

const router: Router = Router()

router.post("/add-to-cart", async (request: Request, response: Response) => response.status(200).json(await saleController.addToCart(request.body)))

router.post("/remove-from-cart", async (request: Request, response: Response) => {
    try {

        const sales = request.body

        if (array.isEmpty(sales))
            throw new Error("No sale has been provided")

        const failedQueries: any[] = []
        const passedQueries: any[] = []

        for (const sale of sales) {
            const removed = await saleController.removeFromCart(sale)
            if (removed.success)
                passedQueries.push(sale)
            else
                failedQueries.push(sale)
        }

        return response.status(200).json({ success: true, message: { passedQueries, failedQueries } })

    } catch (error) {
        return response.status(200).json({ success: true, message: (error as Error).message })
    }
})

router.post("/save", async (request: Request, response: Response) => response.status(200).json(await saleController.saveSale(request.body)))

router.post("/change-quantity", async (request: Request, response: Response) => {
    try {
        const { _id, quantity, branch, updated_by } = request.body;

        // Remove the sale from the cart
        const saleRemoved = await saleController.removeFromCart({
            id: _id,
            branch,
            updated_by,
        });

        if (!saleRemoved.success) throw new Error(saleRemoved.message);

        // Find the sale without using session
        const saleExist: any = await saleModel.findById(_id).lean({ autopopulate: false });

        if (!saleExist) throw new Error("Sale not found");

        // Prepare the updated sale details
        const sale = {
            branch,
            quantity,
            type: saleExist.type,
            created_by: updated_by,
            status: saleExist.status,
            product: saleExist.product,
            customer: saleExist.customer,
            createdAt: saleExist.createdAt,
            order_number: Number(saleExist.number),
            selling_price: saleExist.total_amount / saleExist.quantity,
        };

        // Add the sale back to the cart with updated quantity
        const saleAddedToCart = await saleController.addToCart(sale);

        if (!saleAddedToCart.success) throw new Error(saleAddedToCart.message);

        // Respond with success
        return response.status(200).json({ success: true, message: saleAddedToCart.message });
    } catch (error) {
        // Respond with error
        return response.status(200).json({ success: false, message: (error as Error).message });
    }
});


// customer data
router.get("/customer-data", async (request: Request, response: Response) => {
    try {

        const { customer }: any = request.query

        if (string.getLength(customer) !== 24)
            throw new Error("Invalid customer id")

        const debtsPipeline = [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$visible", true] },
                            { $eq: ["$type", "debtor"] },
                            { $eq: ["$status", "unpaid"] },
                            { $eq: ["$customer", { $toObjectId: customer }] },
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "debts",
                    paid_amount: { $sum: "$paid_amount" },
                    total_amount: { $sum: "$total_amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    total_amount: 1,
                    paid_amount: 1,
                    remain_amount: { $subtract: ["$total_amount", "$paid_amount"] }
                }
            }
        ]

        const salesPipeline = [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$visible", true] },
                            { $eq: ["$type", "sale"] },
                            { $eq: ["$customer", { $toObjectId: customer }] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total_sales: { $sum: "$total_amount" }
                }
            }
        ]

        const result = await controllers.bulkAggregate([
            { schema: "debt", aggregation: debtsPipeline },
            { schema: "sale", aggregation: salesPipeline }
        ])

        if (!result.success)
            throw new Error(result.message)

        const { passedQueries } = result.message

        return response.status(200).json({ success: true, message: passedQueries })

    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})

router.get("/cart-list", async (request: Request, response: Response) => {
    try {

        const { condition, branch } = request.query

        const getSales = () => new Promise((resolve) => resolve(saleController.cartList(condition)))
        const countOrders = () => new Promise((resolve) => resolve(orderModel.countDocuments({ branch })))
        const sales = getSales()
        const orderCount = countOrders()

        const results = {
            sales: await sales,
            orderCount: await orderCount
        }

        return response.status(200).json({ success: true, message: results })

    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})

router.put("/delete", async (request: Request, response: Response) => {
    response.json(await saleController.deleteSale(request.body))
})

router.put("/order-update", async (request: Request, response: Response) => {
    try {

        const { order } = request.body

        const newDocumentData = {
            $set: { tra_printed: true }
        }
        const orderUpdated = await controllers.updateSingleDocument({
            newDocumentData,
            schema: "order",
            condition: { _id: order },
        })

        if (orderUpdated.success) {

            const saleIDS = orderUpdated.message.sales.map((sale: any) => sale._id)

            const salesUpdated = await controllers.updateManyDocument({
                schema: "sale",
                newDocumentData,
                condition: { _id: { $in: saleIDS } }
            })

            if (salesUpdated.success) {
                response.status(200).json({ success: true, message: "success" })
            } else {
                response.status(200).json(salesUpdated)
            }

        } else {
            response.status(200).json(orderUpdated)
        }

    } catch (error) {
        response.status(200).json({ success: false, message: (error as Error).message })
    }
})

router.post("/tra-sales", async (request: Request, response: Response) => {
    try {

        const { total_amount, branch }: any = request.body;
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const salesResult = await controllers.listAllDocuments({
            sort: {},
            select: {},
            schema: "sale",
            joinForeignKeys: true,
            condition: {
                tra_printed: false,
                branch: new mongoose.Types.ObjectId(branch),
                createdAt: { $gte: startOfYear, $lte: endOfYear },
            }
        })

        if (salesResult.success) {
            const sales = salesResult.message
            const result = findNearestCombination(sales, total_amount)
            const salesFromResult = result?.sales

            if (salesFromResult && array.hasElements(salesFromResult)) {
                response.status(200).json({ success: true, message: result })
            } else {
                response.status(200).json({ success: false, message: "no sale has been found" })
            }

        } else {
            response.status(200).json(salesResult)
        }

    } catch (error) {
        // Log and send error response
        response.status(200).json({
            success: false,
            message: (error as Error).message,
        });
    }
});

// Function to find the nearest combination of sales
function findNearestCombination(sales: any[], target: number) {
    let bestMatch = null;
    let smallestDifference = Infinity;

    const n = sales.length;
    // Generate all subsets
    for (let i = 0; i < (1 << n); i++) {
        let subset = [];
        let subsetTotal = 0;

        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                subset.push(sales[j]);
                subsetTotal += sales[j].total_amount;
            }
        }

        const difference = Math.abs(subsetTotal - target);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            bestMatch = {
                sales: subset,
                totalSalesAmount: subsetTotal,
                amountDifference: difference,
            };

            // Exact match
            if (difference === 0) break;
        }
    }

    return bestMatch;
}

export default router