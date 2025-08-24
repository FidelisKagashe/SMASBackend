import { controllers } from "bapig";
import saleModel from "../models/sale";
import { array, object, string, time } from "fast-web-kit";
import { controllerResponse } from "bapig/dist/types";
import productModel from "../models/product";
import adjustmentModel from "../models/adjustment";
import debtModel from "../models/debt";
import activityModel from "../models/activity";
import debt_history from "../models/debt_history";
import orderModel from "../models/order";

// Helper function to log activity
async function createActivity(activityData: any): Promise<void> {
    const activityCreated = await activityModel.create([activityData]);
    if (!activityCreated.length) {
        throw new Error("Failed to log activity");
    }
}

// Helper function to create debt for credit sales
async function createDebtForSale(sale: any, branch: string, created_by: string): Promise<void> {
    const debt = {
        branch,
        created_by,
        type: "debtor",
        status: "unpaid",
        sale: sale._id,
        product: sale.product,
        date: sale.createdAt,
        customer: sale.customer,
        total_amount: sale.total_amount,
        description: `Debt created for sale of ${string.removeCase(sale.product.name, "snake_case").toUpperCase()} on ${time.formatDate(sale.createdAt, "DD/MM/YYYY")}`,
    };
    const debtCreated = await debtModel.create([debt]);
    if (!debtCreated.length) {
        throw new Error("Failed to create debt for sale");
    }
}

// Helper function to handle stock adjustments
async function adjustStock(
    productId: string,
    quantity: number,
    type: "increase" | "decrease",
    branch: string,
    user: string,
    from: string,
    description: string
): Promise<void> {
    const product = await productModel.findById(productId).lean();
    if (!product) {
        throw new Error("Product not found for stock adjustment");
    }
    const adjustment = {
        branch,
        user,
        from,
        type,
        adjustment: quantity,
        created_by: user,
        product: productId,
        before_adjustment: product.stock,
        after_adjustment: type === "increase" ? product.stock + quantity : product.stock - quantity,
        category: product.category || null,
        description,
    };
    const adjustmentCreated = await adjustmentModel.create([adjustment]);
    if (!adjustmentCreated.length) {
        throw new Error("Failed to create stock adjustment");
    }
    const stockUpdate = type === "increase" ? quantity : -quantity;
    const productUpdated = await productModel.updateOne(
        { _id: productId, visible: true },
        { $inc: { stock: stockUpdate }, $set: { updated_by: user } }
    );
    if (productUpdated.modifiedCount !== 1) {
        throw new Error("Failed to update product stock");
    }
}

// List sales in cart
export async function cartList(condition: any): Promise<controllerResponse> {
    try {
        const parsedCondition = object.toObject(condition);
        if (!parsedCondition) {
            throw new Error("Invalid condition provided");
        }

        const sales = await saleModel
            .find(parsedCondition)
            .lean({ autopopulate: true })
            .sort({ createdAt: -1 })
            .select({
                __v: 0,
                type: 0,
                branch: 0,
                account: 0,
                visible: 0,
                category: 0,
                disabled: 0,
                updatedAt: 0,
                reference: 0,
                created_by: 0,
                updated_by: 0,
                stock_after: 0,
                stock_before: 0,
                use_customer_account: 0,
            });

        return { success: true, message: array.isEmpty(sales) ? [] : sales };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

// Add a sale to the cart
export async function addToCart(saleData: any): Promise<controllerResponse> {
    try {
        const { product, created_by, branch, order_number, quantity, selling_price, type, status, customer, createdAt } = saleData;

        // Validate required fields
        if (!product || !created_by || !branch || !order_number || !quantity || !selling_price || !type || !status || !customer || !createdAt) {
            throw new Error("Missing required fields for adding to cart");
        }

        const productExist: any = await productModel.findOne({ _id: product, visible: true }).lean();
        if (!productExist) {
            throw new Error("Product does not exist");
        }

        const stock_before = productExist.stock;
        const stock_after = stock_before - quantity;
        const total_amount = selling_price * quantity;
        const profit = (selling_price - productExist.buying_price) * quantity;
        const discount = (productExist.selling_price - selling_price) * quantity;

        const newSale = {
            branch,
            profit,
            discount,
            quantity,
            created_by,
            stock_after,
            total_amount,
            stock_before,
            type,
            status,
            customer,
            createdAt,
            product: productExist._id,
            number: order_number.toString(),
            category: productExist.category,
        };

        const saleCreated: any = (await saleModel.create([newSale]))[0];
        if (!saleCreated) {
            throw new Error("Failed to create sale");
        }

        if ((type === "cart" || type === "order") && status !== "invoice") {
            await adjustStock(
                productExist._id,
                quantity,
                "decrease",
                branch,
                created_by,
                "sale_cart",
                "Product stock decreased due to sale added to cart"
            );

            if (status === "credit") {
                await createDebtForSale(saleCreated, branch, created_by);
            }
        }

        await createActivity({
            branch,
            created_by,
            module: "sale",
            type: "creation",
            user: created_by,
            data: saleCreated,
            description: "Sale has been added to cart",
        });

        return { success: true, message: saleCreated };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

// Remove a sale from the cart
export async function removeFromCart(saleData: any): Promise<controllerResponse> {
    try {
        const { id, updated_by, branch } = saleData;
        if (!id || !updated_by || !branch) {
            throw new Error("Missing required fields for removing from cart");
        }

        const saleExist: any = await saleModel.findById(id).lean({ autopopulate: true });
        if (!saleExist) {
            throw new Error("Sale not found");
        }

        if (saleExist.status !== "invoice") {
            await adjustStock(
                saleExist.product._id,
                saleExist.quantity,
                "increase",
                branch,
                updated_by,
                "sale_cart",
                "Product stock increased due to sale removed from cart"
            );

            const deleteFilter = { sale: id };
            await debtModel.deleteOne(deleteFilter);
            await debt_history.deleteOne(deleteFilter);
            await adjustmentModel.deleteOne(deleteFilter);
        }

        await createActivity({
            branch,
            module: "sale",
            type: "deletion",
            user: updated_by,
            data: saleExist,
            created_by: updated_by,
            description: "Sale has been removed from cart",
        });

        const saleDeleted = await saleModel.updateOne(
            { _id: id },
            { $set: { visible: false, updated_by } }
        );
        if (saleDeleted.modifiedCount !== 1) {
            throw new Error("Failed to remove sale from cart");
        }

        return { success: true, message: saleExist };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

// Save multiple sales and create an order
export async function saveSale(body: any): Promise<controllerResponse> {
    try {
        const { sales, customer, number, branch, updated_by, printTra, reference } = body;

        if (array.isEmpty(sales)) {
            throw new Error("No sales have been provided");
        }

        const firstSale = await saleModel.findById(sales[0]).lean();
        if (!firstSale) {
            throw new Error("First sale not found");
        }

        const orderType = firstSale.type === "cart" ? "order" : firstSale.status === "invoice" ? "proforma" : "order";
        const saleType = orderType === "proforma" ? "cart" : "sale";
        const isVerified = orderType === "proforma" ? false : true;

        // Validate stock for each sale
        for (const saleId of sales) {
            const saleDoc = await saleModel.findById(saleId).lean();
            if (!saleDoc) {
                throw new Error(`Sale not found: ${saleId}`);
            }
            const product = await productModel.findById(saleDoc.product).lean();
            if (!product) {
                throw new Error(`Product not found for sale: ${saleId}`);
            }
            if (product.stock < saleDoc.quantity) {
                throw new Error(`Insufficient stock for product "${product.name}". Available: ${product.stock}, Required: ${saleDoc.quantity}`);
            }
        }

        const salesUpdated = await saleModel.updateMany(
            { _id: { $in: sales } },
            { $set: { type: saleType, updated_by, tra_printed: printTra } }
        );
        if (salesUpdated.modifiedCount !== sales.length) {
            throw new Error("Failed to update all sales");
        }

        const order = {
            branch,
            number,
            customer,
            type: orderType,
            reference,
            sales,
            tra_printed: printTra,
            created_by: updated_by,
            is_printed: orderType === "order" ? false : false,
            status: orderType === "proforma" ? "pending" : "active",
            is_verified: isVerified,
        };

        const orderCreated = (await orderModel.create([order]))[0];
        if (!orderCreated) {
            throw new Error("Failed to create order");
        }

        await createActivity({
            branch,
            module: "order",
            type: "creation",
            user: updated_by,
            data: orderCreated,
            created_by: updated_by,
            description: `Sale${sales.length > 1 ? "s have" : " has"} been saved and new ${orderType === "proforma" ? "proforma invoice" : "order"} has been created`,
        });

        return { success: true, message: `${orderType === "proforma" ? "Proforma invoice" : "Order"} has been created successfully` };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

// Delete multiple sales
export async function deleteSale(saleIds: string[]): Promise<controllerResponse> {
    try {
        if (!Array.isArray(saleIds) || saleIds.length === 0) {
            throw new Error("No sale IDs provided");
        }

        for (const saleId of saleIds) {
            const saleResult = await controllers.getSingleDocument({
                schema: "sale",
                joinForeignKeys: false,
                condition: { _id: saleId, type: "sale" },
                select: { product: 1, quantity: 1, status: 1, type: 1 },
            });

            if (saleResult.success) {
                const sale = saleResult.message;

                if (sale.type !== "invoice") {
                    const productUpdated = await productModel.updateOne(
                        { _id: sale.product, visible: true },
                        { $inc: { stock: sale.quantity } }
                    );
                    if (productUpdated.modifiedCount !== 1) {
                        throw new Error(`Failed to update stock for product ${sale.product}`);
                    }

                    if (sale.status === "credit") {
                        await debtModel.deleteOne({ sale: sale._id });
                    }

                    const orderUpdateResult = await orderModel.updateOne(
                        { sales: sale._id },
                        { $pull: { sales: sale._id } }
                    );
                    if (orderUpdateResult.modifiedCount === 1) {
                        const updatedOrder = await orderModel.findOne({ sales: sale._id });
                        if (updatedOrder && updatedOrder.sales.length === 0) {
                            await orderModel.deleteOne({ _id: updatedOrder._id });
                        }
                    }
                }
            } else {
                throw new Error(`Sale not found: ${saleId}`);
            }
        }

        const salesDeleted = await saleModel.deleteMany({ _id: { $in: saleIds } });
        if (salesDeleted.deletedCount !== saleIds.length) {
            throw new Error("Failed to delete all specified sales");
        }

        return { success: true, message: `${saleIds.length} sale(s) have been deleted` };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}