import productModel from "../models/product"
import activityModel from "../models/activity"
import purchaseModel from "../models/purchase"
import { controllerResponse } from "bapig/dist/types"
import adjustmentModel from "../models/adjustment"
import { string, time } from "fast-web-kit"
import debtModel from "../models/debt"
import debt_history from "../models/debt_history"

export async function createPurchase(purchase: any): Promise<controllerResponse> {
    try {
        // Check if the product exists
        const productExist = await productModel
            .findOne(
                { _id: purchase.product, visible: true },
                {
                    name: 1,
                    stock: 1,
                    store: 1,
                    category: 1,
                    is_store_product: 1
                }
            )
            .lean({ autopopulate: false });

        if (!productExist) throw new Error("Product does not exist");

        const newPurchase = {
            ...purchase,
            store: productExist.store,
            category: productExist.category,
            stock_before: productExist.stock,
            date: new Date(purchase.date).toISOString(),
            for_store_product: productExist.is_store_product,
            stock_after: productExist.stock + purchase.quantity,
        };

        const purchaseCreated: any = (await purchaseModel.create(newPurchase));

        if (!purchaseCreated) throw new Error("Failed to create product purchase");

        const branch = (purchaseCreated.branch && purchaseCreated.branch._id) || null;
        const created_by = (purchaseCreated.created_by && purchaseCreated.created_by._id) || null;

        // Handle debt if applicable
        if (purchaseCreated.total_amount > purchaseCreated.paid_amount) {
            const debt = {
                branch,
                created_by,
                type: "creditor",
                status: "unpaid",
                product: productExist._id,
                date: purchaseCreated.date,
                purchase: purchaseCreated._id,
                total_amount: purchaseCreated.total_amount - purchaseCreated.paid_amount,
                supplier: (purchaseCreated.supplier && purchaseCreated.supplier._id) || null,
                description: `Cause of debt: Purchase of ${string.removeCase(productExist.name, "snake_case").toUpperCase()} on ${time.formatDate(purchaseCreated.date, "DD/MM/YYYY")}`,
            };

            const debtCreated = await debtModel.create(debt);

            if (!debtCreated) throw new Error("Failed to create purchase debt");
        }

        // Stock adjustment
        const adjustment = {
            branch,
            created_by,
            user: created_by,
            from: "purchase",
            type: "increase",
            product: productExist._id,
            purchase: purchaseCreated._id,
            category: productExist.category,
            adjustment: purchaseCreated.quantity,
            after_adjustment: purchaseCreated.stock_after,
            before_adjustment: purchaseCreated.stock_before,
            description: `Product stock was increased because a new purchase was made`,
        };

        const adjustmentCreated = await adjustmentModel.create(adjustment);

        if (!adjustmentCreated) throw new Error("Failed to create product purchase adjustment");

        // Update product stock
        const productUpdated = await productModel.updateOne(
            { _id: productExist._id },
            {
                $inc: {
                    stock: purchaseCreated.quantity,
                    quantity: purchaseCreated.quantity,
                },
                $set: {
                    buying_price: purchaseCreated.buying_price,
                    selling_price: purchaseCreated.selling_price,
                    reorder_stock_level: purchaseCreated.reorder_stock_level,
                },
            },
            { new: true }
        );

        if (productUpdated.modifiedCount !== 1) throw new Error("Failed to increase product stock");

        // Create activity log
        const activity = {
            branch,
            created_by,
            user: created_by,
            type: "creation",
            module: "purchase",
            data: purchaseCreated,
            description: "New purchase has been created",
        };

        const activityCreated = await activityModel.create(activity);

        if (!activityCreated) throw new Error("Failed to create activity");

        return { success: true, message: "Purchase has been created" };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}


export async function updatePurchase(purchase: any): Promise<controllerResponse> {
    try {
        const { _id, visible, branch, updated_by } = purchase;

        if (string.getLength(_id) !== 24) throw new Error("Invalid purchase id");

        const purchaseExist: any = await purchaseModel
            .findOne({ _id, visible: true })
            .lean({ autopopulate: true });

        if (!purchaseExist) throw new Error("Purchase does not exist");

        const purchaseUpdated = await purchaseModel.updateOne(
            { _id, visible: true },
            {
                $set: {
                    updated_by,
                    ...purchase,
                }
            },
            { new: true }
        );

        if (purchaseUpdated.modifiedCount !== 1) throw new Error("Failed to update purchase");

        if (!visible) {
            const adjustment = {
                branch,
                user: updated_by,
                from: "purchase",
                type: "decrease",
                created_by: updated_by,
                purchase: purchaseExist._id,
                product: purchaseExist.product._id,
                adjustment: purchaseExist.quantity,
                before_adjustment: purchaseExist.product.stock,
                after_adjustment: purchaseExist.product.stock - purchaseExist.quantity,
                description: `Product stock was decreased because purchase was deleted`,
                category: (purchaseExist.category && purchaseExist.category._id) || null,
            };

            const adjustmentCreated = await adjustmentModel.create(adjustment);

            if (!adjustmentCreated) throw new Error("Failed to create product purchase adjustment");

            const quantity = -1 * purchaseExist.quantity;
            const productUpdated = await productModel.updateOne(
                { _id: purchaseExist.product, visible: true },
                {
                    $set: { updated_by },
                    $inc: {
                        quantity,
                        stock: quantity,
                    }
                },
                { new: true }
            );

            if (productUpdated.modifiedCount !== 1) throw new Error("Failed to update product stock");

            const filter = { purchase: purchaseExist._id, visible: true };

            const debtDeleted = await debtModel.deleteOne(filter);

            if (debtDeleted.deletedCount === 1) {
                await debt_history.deleteMany(filter);
            }
        }

        const activity = {
            branch,
            user: updated_by,
            module: "purchase",
            data: purchaseExist,
            created_by: updated_by,
            type: !visible ? "deletion" : "modification",
            description: !visible ? "Purchase has been deleted temporarily" : "Purchase has been modified",
        };

        const activityCreated = await activityModel.create(activity);

        if (!activityCreated) throw new Error("Failed to create activity");

        return { success: true, message: "Purchase has been updated" };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
