import { controllerResponse } from "bapig/dist/types";
import activityModel from "../models/activity";
import purchaseModel from "../models/purchase";
import productModel from "../models/product";
import { string } from "fast-web-kit";
import saleModel from "../models/sale";
import adjustmentModel from "../models/adjustment";
import serviceModel from "../models/service";
import stockModel from "../models/stock";

const productRelatedModels = [
    saleModel,
    stockModel,
    serviceModel,
    purchaseModel,
    adjustmentModel,
]

export async function createProduct(product: any): Promise<controllerResponse> {
    try {
        // Create new product
        const productCreated: any = await productModel.create(product);

        // Check if product creation was successful
        if (!productCreated) throw new Error("Failed to create product");

        // If stock is greater than 0, create a purchase transaction
        if (product.stock > 0) {
            const amount = product.stock * product.buying_price;

            // Define purchase object
            const purchase = {
                stock_before: 0,
                paid_amount: amount,
                total_amount: amount,
                product: productCreated._id,
                date: new Date().toISOString(),
                quantity: productCreated.stock,
                stock_after: productCreated.stock,
                buying_price: productCreated.buying_price,
                selling_price: productCreated.selling_price,
                for_store_product: productCreated.is_store_product,
                store: (productCreated.store && productCreated.store._id) || null,
                branch: (productCreated.branch && productCreated.branch._id) || null,
                category: (productCreated.category && productCreated.category._id) || null,
                created_by: (productCreated.created_by && productCreated.created_by._id) || null,
            };

            // Create purchase
            const purchaseCreated = await purchaseModel.create(purchase);

            // Check if purchase creation was successful
            if (!purchaseCreated) throw new Error("Failed to create product purchase");
        }

        // Define activity object
        const activity = {
            type: "creation",
            module: "product",
            data: productCreated,
            description: "New product has been created",
            branch: (productCreated.branch && productCreated.branch._id) || null,
            user: (productCreated.created_by && productCreated.created_by._id) || null,
            created_by: (productCreated.created_by && productCreated.created_by._id) || null,
        };

        // Create activity record
        const activityCreated = await activityModel.create(activity);

        // Check if activity creation was successful
        if (!activityCreated) throw new Error("Failed to create activity");

        return { success: true, message: "Product has been created" };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}


export async function updateProduct(product: any): Promise<controllerResponse> {
    try {
        const { _id, updated_by, branch, old_stock, stock } = product;
        const filterForOtherModels = { product: _id };

        if (string.getLength(_id) !== 24) throw new Error("Invalid product id");

        const productExist: any = await productModel
            .findOne({ _id })
            .lean({ autopopulate: true });

        if (!productExist) throw new Error("Product does not exist");

        const productUpdated = await productModel.updateOne(
            { _id },
            { $set: product },
            { new: true }
        );

        if (productUpdated.modifiedCount !== 1) throw new Error("Failed to update product");

        // Check if purchase exists with zero amount when product was created
        if ((product.buying_price > 0) && product.visible) {
            const purchaseExist = await purchaseModel.findOne(
                {
                    product: product._id,
                    total_amount: 0,
                    paid_amount: 0,
                    visible: true,
                },
                { _id: 1 }
            ).lean({ autopopulate: false });

            if (purchaseExist) {
                const amount = product.buying_price * product.stock;
                const purchaseUpdated = await purchaseModel.updateOne(
                    filterForOtherModels,
                    {
                        $set: {
                            updated_by,
                            paid_amount: amount,
                            total_amount: amount
                        }
                    },
                    { new: true }
                );

                if (purchaseUpdated.modifiedCount !== 1)
                    throw new Error("Failed to update product purchase");
            }
        }

        // Handle soft deletion or restoration
        if (!product.visible || product.restore) {
            const newData = { visible: product.restore ? product.restore : product.visible, updated_by };

            for (const model of productRelatedModels) {
                await model.updateMany(
                    filterForOtherModels,
                    { $set: newData },
                    { new: true }
                );
            }
        }

        // Handle stock adjustment
        if (stock !== old_stock) {
            const adjustedStock = old_stock - stock;
            const adjustmentType = adjustedStock < 0 ? "increase" : "decrease";
            const positiveAdjustment = adjustedStock < 0 ? adjustedStock * -1 : adjustedStock;

            const adjustment = {
                branch,
                from: "user",
                user: updated_by,
                type: adjustmentType,
                created_by: updated_by,
                after_adjustment: stock,
                product: productExist._id,
                before_adjustment: old_stock,
                adjustment: positiveAdjustment,
                description: `Stock has been manually ${adjustmentType === "decrease" ? "decreased" : 'increased'} due to product edit`,
                category: (productExist.category && productExist.category._id) || null
            };

            const adjustmentCreated = await adjustmentModel.create(adjustment);

            if (!adjustmentCreated) throw new Error("Failed to create adjustment");
        }

        // Create activity record
        const productDeleted = !product.visible && !product.restore;
        const activity = {
            branch,
            user: updated_by,
            module: "product",
            data: productExist,
            created_by: updated_by,
            type: productDeleted ? "deletion" : product.restore ? "restoration" : "modification",
            description: productDeleted ? "Product has been deleted temporarily" : product.restore ? "Product has been restored" : "Product has been modified",
        };

        const activityCreated = await activityModel.create(activity);

        if (!activityCreated) throw new Error("Failed to create activity");

        return { success: true, message: "Product has been updated" };

    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}
