//import { controllers } from "bapig"
import orderModel from "../models/order"
import saleModel from "../models/sale"
import { array, object, string } from "fast-web-kit"
import { controllerResponse } from "bapig/dist/types"
import activityModel from "../models/activity"

export async function createOrder(orderData: any): Promise<controllerResponse> {
    try {
        const { sales, customer, number, branch, created_by, type = "order", reference } = orderData;

        if (array.isEmpty(sales))
            throw new Error("No sales have been provided");

        // Validate order type
        const validTypes = ["order", "proforma", "invoice"];
        if (!validTypes.includes(type))
            throw new Error("Invalid order type");

        // Check stock for each sale before proceeding
        for (const saleId of sales) {
            const saleDoc = await saleModel.findById(saleId).lean();
            if (!saleDoc) throw new Error(`Sale not found: ${saleId}`);
            const product = await require("../models/product").default.findById(saleDoc.product).lean();
            if (!product) throw new Error(`Product not found for sale: ${saleId}`);
            if (product.stock < saleDoc.quantity) {
                throw new Error(`Stock for product "${product.name}" is not enough. Available: ${product.stock}, Required: ${saleDoc.quantity}`);
            }
        }

        // Update sales based on order type
        let salesUpdateData: any = { updated_by: created_by };
        
        if (type === "proforma") {
            salesUpdateData.type = "cart"; // Keep as cart for proforma
        } else if (type === "invoice") {
            salesUpdateData.type = "sale";
            salesUpdateData.tra_printed = true;
        } else {
            salesUpdateData.type = "sale";
        }

        const salesUpdated = await saleModel.updateMany(
            { _id: { $in: sales } },
            { $set: salesUpdateData },
            { new: true }
        );

        if (salesUpdated.modifiedCount !== array.getLength(sales))
            throw new Error("Failed to update sales status");

        const order = {
            branch,
            number,
            customer,
            type,
            reference,
            sales: sales,
            created_by: created_by,
            is_printed: type === "invoice" ? true : false,
            tra_printed: type === "invoice" ? true : false,
            status: type === "proforma" ? "pending" : "active"
        };

        const orderCreated = (await orderModel.create([order]))[0];

        if (!orderCreated) throw new Error("Failed to create order");

        const activity = {
            branch,
            module: "order",
            type: "creation",
            user: created_by,
            data: orderCreated,
            created_by: created_by,
            description: `${type === "proforma" ? "Proforma invoice" : type === "invoice" ? "Invoice" : "Order"} has been created`,
        };

        const activityCreated = (await activityModel.create([activity]))[0];

        if (!activityCreated) throw new Error("Failed to create activity");

        return { success: true, message: `${type === "proforma" ? "Proforma invoice" : type === "invoice" ? "Invoice" : "Order"} has been created successfully` };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function getOrdersList(condition: any): Promise<controllerResponse> {
    try {
        condition = object.toObject(condition);

        const orders = await orderModel
            .find(condition)
            .lean({ autopopulate: true })
            .sort({ createdAt: -1 })
            .select({
                __v: 0,
                updatedAt: 0,
                updated_by: 0,
                disabled: 0,
            });

        return { success: true, message: array.isEmpty(orders) ? [] : orders };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function confirmProformaInvoice(orderData: any): Promise<controllerResponse> {
    try {
        const { orderId, updated_by, branch } = orderData;

        // Validate orderId as a 24-character MongoDB ObjectId
        if (string.getLength(orderId) !== 24) 
            throw new Error("Invalid order ID: must be a 24-character string");

        // Fetch the order without specifying type initially
        const order: any = await orderModel
            .findOne({ _id: orderId, visible: true })
            .lean({ autopopulate: true });

        if (!order) 
            throw new Error("Order not found");

        // Handle based on order type
        if (order.type === "proforma") {
            // Update only the order for proforma type
            const orderUpdated = await orderModel.updateOne(
                { _id: orderId },
                {
                    $set: {
                        updated_by,
                        status: "done",
                        type: "invoice",
                        is_printed: false,
                        tra_printed: false,
                        is_verified: true
                    }
                }
            );

            if (orderUpdated.modifiedCount !== 1) 
                throw new Error("Failed to update proforma invoice to regular invoice");

            console.log("Order updated to invoice");

            // Log the confirmation activity
            const activity = {
                branch,
                module: "order",
                type: "modification",
                user: updated_by,
                data: order,
                created_by: updated_by,
                description: "Proforma invoice has been confirmed and converted to invoice",
            };
            await activityModel.create([activity]);

            return { 
                success: true, 
                message: "Proforma invoice updated successfully" 
            };
        } else if (order.type === "invoice") {
            // Log sales before update for debugging
            const salesDocs = await saleModel.find({ _id: { $in: order.sales } });
            console.log("Sales before update:", salesDocs.map(s => ({ _id: s._id, visible: s.visible, type: s.type })));

            // Extract sales IDs safely
            const salesIds = Array.isArray(order.sales) ? order.sales : [];
            if (salesIds.length === 0) 
                throw new Error("No sales associated with this invoice");

            // Update related sales to "sale" type
            const salesUpdateResult = await saleModel.updateMany(
                { _id: { $in: salesIds } },
                {
                    $set: {
                        type: "sale",
                        updated_by,
                        tra_printed: true,
                        visible: true,
                        disabled: false,
                        status: "cash"
                    }
                }
            );

            console.log("Sales update result:", salesUpdateResult);

            // Verify all sales were updated
            if (salesUpdateResult.modifiedCount !== salesIds.length) 
                throw new Error("Failed to update all related sales");

            // Fetch updated sales for stock reduction
            const updatedSales = await saleModel.find({ _id: { $in: salesIds } });

            // Reduce stock for each product
            for (const sale of updatedSales) {
                const productModel = require("../models/product").default;
                const productUpdated = await productModel.updateOne(
                    { _id: sale.product },
                    { $inc: { stock: -sale.quantity } }
                );
                if (productUpdated.modifiedCount !== 1) 
                    throw new Error(`Failed to reduce stock for product ${sale.product}`);
            }

            // Update verified_sales to true
            const orderVerifiedUpdate = await orderModel.updateOne(
                { _id: orderId },
                { $set: { verified_sales: true } }
            );
            if (orderVerifiedUpdate.modifiedCount !== 1)
                throw new Error("Failed to verify sales for invoice");

            return { 
                success: true, 
                message: "Invoice sales and stock updated successfully" 
            };
        } else {
            throw new Error("Invalid order type");
        }

    } catch (error) {
        console.error("Error in confirmProformaInvoice:", error);
        return { 
            success: false, 
            message: (error as Error).message 
        };
    }
}

export async function deleteOrder(orderData: any): Promise<controllerResponse> {
    try {
        const { orderId, updated_by, branch } = orderData;

        if (string.getLength(orderId) !== 24) 
            throw new Error("Invalid order id");

        const orderExist: any = await orderModel
            .findOne({ _id: orderId, visible: true })
            .lean({ autopopulate: true });

        if (!orderExist) 
            throw new Error("Order not found");

        // Update order visibility
        const orderUpdated = await orderModel.updateOne(
            { _id: orderId },
            {
                $set: {
                    visible: false,
                    updated_by,
                }
            }
        );

        if (orderUpdated.modifiedCount !== 1) 
            throw new Error("Failed to delete order");

        // Update related sales based on order type
        const salesIds = Array.isArray(orderExist.sales) ? orderExist.sales : [];
        let salesUpdateData: any = { visible: false, updated_by };

        if (orderExist.type === "proforma") {
            salesUpdateData.type = "cart";
        }

        await saleModel.updateMany(
            { _id: { $in: salesIds } },
            { $set: salesUpdateData }
        );

        // Create activity
        const activity = {
            branch,
            module: "order",
            type: "deletion",
            user: updated_by,
            data: orderExist,
            created_by: updated_by,
            description: `${orderExist.type === "proforma" ? "Proforma invoice" : orderExist.type === "invoice" ? "Invoice" : "Order"} has been deleted`,
        };

        await activityModel.create([activity]);

        return { success: true, message: `${orderExist.type === "proforma" ? "Proforma invoice" : orderExist.type === "invoice" ? "Invoice" : "Order"} deleted successfully` };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
