import { Router, Request, Response } from "express"
import * as purchaseController from "../controllers/purchase"
import { array } from "fast-web-kit"

const router: Router = Router()

router.post("/create", async (request: Request, response: Response) => response.status(200).json(await purchaseController.createPurchase(request.body)))

router.post("/bulk-create", async (request: Request, response: Response) => {
    try {

        const purchases = request.body

        if (array.isEmpty(purchases))
            throw new Error("No purchase has been provided")

        const failedpurchases: any[] = []
        const purchaseLength = array.getLength(purchases)

        for (const purchase of purchases) {
            const purchaseCreated = await purchaseController.createPurchase(purchase)
            if (!purchaseCreated.success)
                failedpurchases.push(purchase)
        }

        if (array.isEmpty(failedpurchases))
            return response.status(200).json({ success: true, message: `${purchaseLength} purchases have been created` })

        return response.status(200).json({ success: false, message: `Failed to create ${array.getLength(failedpurchases)} purchase(s) out of ${purchaseLength}` })


    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})

router.put("/update", async (request: Request, response: Response) => response.status(200).json(await purchaseController.updatePurchase(request.body)))


router.put("/bulk-update", async (request: Request, response: Response) => {
    try {

        const purchases = request.body

        if (array.isEmpty(purchases))
            throw new Error("No purchase has been provided")

        const failedQueries: any[] = []
        const passedQueries: any[] = []

        for (const purchase of purchases) {
            const purchaseUpdated = await purchaseController.updatePurchase(purchase)
            if (!purchaseUpdated.success)
                failedQueries.push(purchase)
            else
                passedQueries.push(purchase)
        }

        return response.status(200).json({ success: true, message: { passedQueries, failedQueries } })

    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})

export default router

// 1190479982