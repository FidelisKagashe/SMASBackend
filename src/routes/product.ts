import { array } from "fast-web-kit"
import { Router, Request, Response } from "express"
import * as productController from "../controllers/product"

const router: Router = Router()

router.post("/create", async (request: Request, response: Response) => response.status(200).json(await productController.createProduct(request.body)))

router.post("/bulk-create", async (request: Request, response: Response) => {
    try {

        const products = request.body

        if (array.isEmpty(products))
            throw new Error("No product has been provided")

        const failedProducts: any[] = []
        const productLength = array.getLength(products)

        for (const product of products) {
            const productCreated = await productController.createProduct(product)
            if (!productCreated.success)
                failedProducts.push(product)
        }

        if (array.isEmpty(failedProducts))
            return response.status(200).json({ success: true, message: `${productLength} products have been created` })

        return response.status(200).json({ success: false, message: `Failed to create ${array.getLength(failedProducts)} product(s) out of ${productLength}` })

    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})

router.put("/update", async (request: Request, response: Response) => response.status(200).json(await productController.updateProduct(request.body)))

router.put("/bulk-update", async (request: Request, response: Response) => {
    try {

        const products = request.body

        if (array.isEmpty(products))
            throw new Error("No product has been provided")

        const failedQueries: any[] = []
        const passedQueries: any[] = []

        for (const product of products) {
            const productUpdated = await productController.updateProduct(product)
            if (!productUpdated.success)
                failedQueries.push(product)
            else
                passedQueries.push(product)
        }

        return response.status(200).json({ success: true, message: { passedQueries, failedQueries } })

    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})


export default router