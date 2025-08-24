import { Router, Request, Response } from "express"
import * as orderController from "../controllers/order"
import { array } from "fast-web-kit"

const router: Router = Router()

// Create new order (normal, proforma, or invoice)
router.post("/create", async (request: Request, response: Response) => {
    response.status(200).json(await orderController.createOrder(request.body))
})

// Get orders list with filtering by type
router.get("/list", async (request: Request, response: Response) => {
    try {
        const { type, branch, status, ...otherConditions } = request.query;
        
        let condition: any = {
            visible: true,
            branch,
            ...otherConditions
        };

        // Filter by order type if specified
        if (type) {
            condition.type = type;
            
            // For done proforma invoices, add status filter
            if (type === "proforma" && status === "done") {
                condition.status = "done";
            } else if (type === "proforma" && !status) {
                // For regular proforma invoices, exclude done ones
                condition.status = { $ne: "done" };
            }
        }

        const result = await orderController.getOrdersList(condition);
        response.status(200).json(result);

    } catch (error) {
        response.status(200).json({ 
            success: false, 
            message: (error as Error).message 
        });
    }
})

// Convert proforma to invoice (confirm proforma)
router.put("/confirm-proforma", async (request: Request, response: Response) => {
    try {
        const { orderId, updated_by, branch } = request.body;

        if (!orderId) throw new Error("Order ID is required");

        const orderUpdated = await orderController.confirmProformaInvoice({
            orderId,
            updated_by,
            branch
        });

        response.status(200).json(orderUpdated);

    } catch (error) {
        response.status(200).json({ 
            success: false, 
            message: (error as Error).message 
        });
    }
})

// Delete order
router.put("/delete", async (request: Request, response: Response) => {
    try {
        const orders = request.body;

        if (array.isEmpty(orders))
            throw new Error("No orders have been provided");

        const failedQueries: any[] = [];
        const passedQueries: any[] = [];

        for (const orderId of orders) {
            const orderDeleted = await orderController.deleteOrder({
                orderId,
                updated_by: request.body.updated_by || null,
                branch: request.body.branch || null
            });
            
            if (orderDeleted.success)
                passedQueries.push(orderId);
            else
                failedQueries.push(orderId);
        }

        return response.status(200).json({ 
            success: true, 
            message: { passedQueries, failedQueries } 
        });

    } catch (error) {
        return response.status(200).json({ 
            success: false, 
            message: (error as Error).message 
        });
    }
})

// Bulk operations
router.post("/bulk-create", async (request: Request, response: Response) => {
    try {
        const orders = request.body

        if (array.isEmpty(orders))
            throw new Error("No orders have been provided")

        const failedOrders: any[] = []
        const orderLength = array.getLength(orders)

        for (const order of orders) {
            const orderCreated = await orderController.createOrder(order)
            if (!orderCreated.success)
                failedOrders.push(order)
        }

        if (array.isEmpty(failedOrders))
            return response.status(200).json({ 
                success: true, 
                message: `${orderLength} orders have been created` 
            })

        return response.status(200).json({ 
            success: false, 
            message: `Failed to create ${array.getLength(failedOrders)} order(s) out of ${orderLength}` 
        })

    } catch (error) {
        return response.status(200).json({ 
            success: false, 
            message: (error as Error).message 
        })
    }
})

export default router