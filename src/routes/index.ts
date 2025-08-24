import saleRoutes from "./sale"
import { Router } from "express"
import customRoutes from "./custom"
import requestRoutes from "./request"
import productRoutes from "./product"
import purchaseRoutes from "./purchase"
import orderRoutes from "./order"
import { router as bapigRoutes } from "bapig"

const router: Router = Router()

router.use("/", bapigRoutes)
router.use("/sale", saleRoutes)
router.use("/custom", customRoutes)
router.use("/request", requestRoutes)
router.use("/product", productRoutes)
router.use("/purchase", purchaseRoutes)
router.use("/order", orderRoutes)

export default router