// dependencies
import numeral from "numeral"
import pluralize from "pluralize"
import { controllers } from "bapig"
import { time, number, string, array } from "fast-web-kit"
import { controllerResponse, list } from "bapig/dist/types"
import { contacts, domain, emessageAPIKey, getVendorName, reportConfig, sendSMS, zipBranchData } from "."
import * as saleController  from "../controllers/sale"

// destrucutring time functions
const {
    currentDay,
    currentHour,
    currentMinute,
    currentTimeInMilliseconds
} = time

// finding condition
const condition: object = { visible: true }
const select: object = { phone_number: 1, name: 1, _id: 1, vendor: 1, api_key: 1, settings: 1, fee: 1, days: 1, type: 1 }

// notification days
const notificationDays: number[] = [1, 3, 5, 7]

export type branch = {
    _id: string
    fee: number
    days: number
    name: string
    type: string
    settings: any
    vendor: string
    api_key: string
    phone_number: string
}

// get all branches (shops)
export const getBranches = async (): Promise<branch[]> => {
    try {

        // finding all branches
        const result: controllerResponse = await controllers.listAllDocuments({
            select,
            schema: "branch",
            sort: { name: 1 },
            joinForeignKeys: false,
            condition: { ...condition, days: { $gt: 0 } },
        })

        if (result.success)
            return result.message

        return []

    } catch (error) {
        console.log(`Branches error ${(error as Error).message}`)
        return []
    }
}

// decrement branch days 1am
export const decrementBranchDays = async (): Promise<void> => {
    try {

        if (currentHour() === 1) {

            await controllers.updateManyDocument({
                condition,
                schema: "branch",
                newDocumentData: {
                    $inc: { days: -1 }
                }
            })
        }

    } catch (error) {
        console.log(`Decrement branch days error:  ${(error as Error).message}`)
    }
}

// checking branch remaining days and send notifiaction at 8am
export const checkBranchRemainingDays = async (): Promise<void> => {
    try {

        if ((currentHour() === 8) && (notificationDays.includes(currentDay()))) {

            // finding branches
            const result: controllerResponse = await controllers.listAllDocuments({
                schema: "branch",
                sort: { name: 1 },
                joinForeignKeys: false,
                condition: { days: { $lte: 7 }, fee: { $gt: 0 }, visible: true },
                select: { fee: 1, days: 1, name: 1, phone_number: 1, settings: 1, type: 1, api_key: 1, vendor: 1 }
            })

            // checking result success status
            if (result.success) {

                // getting array of branches
                const branches: branch[] = result.message

                if (branches.length > 0)
                    for (const branch of branches) {

                        const notifications: string[] = branch.settings.notifications

                        if (notifications.includes("monthly_subscription")) {
                            const days: number = branch.days
                            let receivers: string[] = []
                            let message: string = ""

                            if (days >= 0) {
                                receivers = [`+${branch.phone_number}`]
                                message = `Urgent! Subscription ${days === 0 ? "has exprired" : `is expiring in ${days === 1 ? "24 hours" : `${days} days`}`}🚨\n\nHi ${string.removeCase(branch.name, "snake_case").toUpperCase()},\n\nYour system subscription ${days === 0 ? "has expired" : `is expiring in just ${days === 1 ? "24 hours" : `${days} days`}`}⏳ To prevent any service interruption, please renew now for the next 3 months or more.\n\nAct fast to stay connected! 💻💪\n\nThank you,\nCustomer Support (${contacts})\n${domain}`
                            }
                            else if (days < 0) {
                                receivers = [`+${branch.phone_number}`]
                                message = `${string.removeCase(branch.name, "snake_case").toUpperCase()} will be deleted permanently in ${7 + days} days.`
                            }

                            if (receivers.length > 0) {
                                sendSMS({
                                    message,
                                    receivers,
                                    apiKey: emessageAPIKey,
                                    vendor: getVendorName(branch)
                                })
                            }

                        }

                    }

            }

        }

    } catch (error) {
        console.log(`Checking branch remainig days error: ${(error as Error).message}`)
    }
}

// sending customer debts notification at 10am
export const remindCustomerDebt = async (): Promise<void> => {
    try {

        if ((currentHour() === 10) && notificationDays.includes(currentDay())) {
            for (const branch of await getBranches()) {

                if (branch && branch.settings.notifications.includes("customer_debt_reminder")) {

                    const customersResult: controllerResponse = await controllers.listAllDocuments({
                        sort: { name: 1 },
                        schema: "customer",
                        joinForeignKeys: false,
                        select: { name: 1, phone_number: 1 },
                        condition: { ...condition, branch: branch._id },
                    })

                    if (customersResult.success) {
                        for (const customer of customersResult.message) {

                            const debtsResult: controllerResponse = await controllers.listAllDocuments({
                                schema: "debt",
                                sort: { createdAt: 1 },
                                joinForeignKeys: false,
                                select: { total_amount: 1, paid_amount: 1 },
                                condition: { ...condition, branch: branch._id, customer: customer._id, $expr: { $ne: ["$total_amount", "$paid_amount"] }, type: "debtor" }
                            })

                            if (debtsResult.success) {

                                const totalDebt = debtsResult.message.map((debt: any) => debt.total_amount - debt.paid_amount).reduce((a: number, b: number) => a + b, 0)

                                const message: string = `Habari yako ${string.removeCase(customer.name, "snake_case").toUpperCase()}, duka la ${string.removeCase(branch.name, "snake_case").toUpperCase()} wanakukumbusha kulipa deni lako la TZS ${numeral(totalDebt).format("0,0")}, kwa maelezo zaidi wasiliana na ${branch.phone_number}.`
                                const receivers: string[] = [`+${customer.phone_number}`]

                                // Ujumbe umetumwa kutoka kwenye mfumo wa: ${domain}`

                                if (branch.api_key && branch.vendor)
                                    sendSMS({
                                        message,
                                        receivers,
                                        vendor: branch.vendor,
                                        apiKey: branch.api_key
                                    })
                            }
                        }
                    }

                }
            }

        }

    } catch (error) {
        console.log(`customer debt reminder error: ${(error as Error).message}`)
    }
}

// check incomplete services at 14
export const checkIncompleteServices = async (): Promise<void> => {
    try {

        if ((currentHour() === 14) && (notificationDays.includes(currentDay()))) {

            const services = await controllers.listAllDocuments({
                schema: "service",
                joinForeignKeys: true,
                sort: { createdAt: -1 },
                select: { number: 1, device: 1, branch: 1, customer: 1 },
                condition: { ...condition, status: "incomplete" }
            })

            if (services.success) {
                for (const service of services.message) {
                    if (array.elementExist(service.branch.settings.notifications, "incomplete_service")) {
                        const serviceNumber: string = service.number
                        const receivers: string[] = [`+255${service.branch.phone_number.substring(1)}`]
                        const customerName: string = string.toTitleCase(string.removeCase(service.customer.name, "snake_case"))
                        const branchName: string = string.toTitleCase(string.removeCase(service.branch.name, "snake_case"))
                        const deviceName: string = string.toTitleCase(string.removeCase(service.device.name, "snake_case"))
                        const message = `${branchName} huduma nambari ${serviceNumber} ya ${customerName} ambaye ana kifaa chenye jina la ${deviceName} bado haijakamilishwa. Tunapenda kuwakumbusha kwamba tunatarajia huduma hiyo kukamilishwa kwa haraka iwezekanavyo ili mteja aweze kurudi kutumia kifaa chake kwa wakati.`
                        sendSMS({
                            message,
                            receivers,
                            apiKey: emessageAPIKey,
                            vendor: getVendorName(service.branch)
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log((error as Error).message)
    }
}

// checking branch product status at 11am
export const checkBranchProductStatus = async (): Promise<void> => {
    try {

        if ((currentHour() === 11) && (notificationDays.includes(currentDay()))) {
            for (const branch of await getBranches()) {
                if (branch && branch.settings.notifications.includes("product_stock")) {

                    const branchId: string = branch._id
                    const receivers: string[] = [`+${branch.phone_number}`]
                    const outOfStock: number = (await controllers.countDocuments({
                        schema: "product",
                        condition: { branch: branchId, ...condition, stock: { $lte: 0 } }
                    })).message
                    const almostOutOfStock: number = (await controllers.countDocuments({
                        schema: "product",
                        condition: { branch: branchId, ...condition, stock: { $gt: 0 }, $expr: { $lte: ["$stock", "$reorder_stock_level"] } }
                    })).message
                    const message: string = `${string.removeCase(branch.name, "snake_case").toUpperCase()} has ${outOfStock} finished products and ${almostOutOfStock} products that will finish soon.\n${domain}/product/list`

                    if ((outOfStock !== 0) || (almostOutOfStock !== 0))
                        sendSMS({
                            message,
                            receivers,
                            apiKey: emessageAPIKey,
                            vendor: getVendorName(branch)
                        })
                }
            }
        }

    } catch (error) {
        console.log(`Checking product status error: ${(error as Error).message}`)
    }
}

// checking branch unpaid debts at 16pm
export const checkBranchUnpaidDebts = async (): Promise<void> => {
    try {

        if ((currentHour() === 16) && (notificationDays.includes(currentDay()))) {
            for (const branch of await getBranches()) {
                if (branch && branch.settings.notifications.includes("daily_debts_report")) {

                    const result: controllerResponse = await controllers.listAllDocuments({
                        schema: "debt",
                        sort: { createdAt: 1 },
                        joinForeignKeys: false,
                        select: { total_amount: 1, paid_amount: 1, type: 1 },
                        condition: { branch: branch._id, ...condition, $expr: { $ne: ["$total_amount", "$paid_amount"] } }
                    })

                    if (result.success) {
                        const debts = result.message
                        const customerDebts: number = debts.filter((debt: any) => debt.type === "debtor").map((debt: any) => debt.total_amount - debt.paid_amount).reduce((a: number, b: number) => a + b, 0)
                        const shopDebts: number = debts.filter((debt: any) => debt.type === "creditor").map((debt: any) => debt.total_amount - debt.paid_amount).reduce((a: number, b: number) => a + b, 0)
                        const message: string = `${string.removeCase(branch.name, "snake_case").toUpperCase()} linadaiwa TZS ${numeral(shopDebts).format("0,0")} na linadai wateja TZS ${numeral(customerDebts).format("0,0")}.\n${domain}/debt/list`
                        const receivers: string[] = [`+${branch.phone_number}`]

                        if ((customerDebts !== 0) || (shopDebts !== 0))
                            sendSMS({
                                message,
                                receivers,
                                apiKey: emessageAPIKey,
                                vendor: getVendorName(branch)
                            })
                    }

                }
            }
        }

    } catch (error) {
        console.log(`Checking branch unpaid debts error: ${(error as Error).message}`)
    }
}

// checking branch unpaid expense and purchases at 14
export const checkBranchUnpaidExpenseAndPurchase = async (): Promise<void> => {
    try {

        if ((currentHour() === 14) && (notificationDays.includes(currentDay())))
            for (const branch of await getBranches())
                if (branch && branch.settings.notifications.includes("unpaid_expense_and_purchase")) {
                    const sort = {}
                    const select = { total_amount: 1, paid_amount: 1 }
                    const condition = { branch: branch._id, visible: true, $expr: { $ne: ["$total_amount", "$paid_amount"] } }
                    const response = await controllers.bulkListAllDocuments([
                        { schema: "expense", condition, select, joinForeignKeys: false, sort },
                        { schema: "purchase", condition, select, joinForeignKeys: false, sort }
                    ])

                    if (response.success) {

                        const { passedQueries: { purchases, expenses } } = response.message
                        const totalExpense = expenses.length > 0 ? expenses.map((expense: any) => expense.total_amount - expense.paid_amount).reduce((a: number, b: number) => a + b) : 0
                        const totalPurchase = purchases.length > 0 ? purchases.map((purchase: any) => purchase.total_amount - purchase.paid_amount).reduce((a: number, b: number) => a + b) : 0

                        if ((totalExpense !== 0) || (totalPurchase !== 0)) {
                            const message = `${string.removeCase(branch.name, "snake_case").toUpperCase()} duka lako lina ununuzi usiolipwa kiasi cha TZS ${numeral(totalPurchase).format("0,0")} na matumizi yasiyolipwa kiasi cha TZS ${numeral(totalExpense).format("0,0")}`
                            const receivers = [`+${branch.phone_number}`]

                            sendSMS({
                                message,
                                receivers,
                                apiKey: emessageAPIKey,
                                vendor: getVendorName(branch)
                            })

                        }
                    }
                }

    } catch (error) {
        console.log(`Checking branch unpaid expenses and purchases error: ${(error as Error).message}`)
    }
}

// delete inactive branch and its data every sunday
export const deleteInactiveBranch = async (): Promise<void> => {
    try {

        const result: controllerResponse = await controllers.listAllDocuments({
            schema: "branch",
            sort: {},
            select: {},
            joinForeignKeys: false,
            condition: { days: { $lte: -7 } }
        })

        if (result.success) {

            const branches = result.message

            for (const branch of branches) {

                // Construct the filename based on branch details
                const fileName: string = `${branch.name}_${branch.phone_number}_${branch.address.region}`;

                // Zip the branch data
                const result: controllerResponse = await zipBranchData(branch, fileName, false);

                if (result.success) {
                    controllers.deleteSingleDocument({
                        schema: "branch",
                        condition: { _id: branch._id }
                    })
                }

            }
        }

    } catch (error) {
        console.log(`Delete in active branches error: ${(error as Error).message}`)
    }
}

// deletng deleted data
export const deleteDeletedData = async (): Promise<void> => {
    try {

        const result = await controllers.listAllCollections({
            condition: { visible: false },
            sort: {},
            joinForeignKeys: false,
        })

        if (result.success) {
            const datas = result.message
            const days = number.toMilliseconds(7, "days")

            for (const key in datas) {
                const dataArray = datas[key]
                for (const data of dataArray) {
                    const daysFromDeletion = currentTimeInMilliseconds() - new Date(data.updatedAt).getTime()
                    if (daysFromDeletion >= days) {
                        controllers.deleteSingleDocument({ schema: pluralize.singular(key), condition: { _id: data._id } })
                    }
                }
            }
        }


    } catch (error) {
        console.log(`Delete deleted data error ${(error as Error).message}`)
    }
}

// capture product stock every 23:59
export const captureProductStock = async (): Promise<void> => {
    try {

        if ((currentHour() >= 23) && (currentMinute() >= 59)) {
            const date = new Date().setHours(23, 59, 0)
            const products: controllerResponse = await controllers.listAllDocuments({
                sort: {},
                condition,
                schema: "product",
                select: { stock: 1, branch: 1, created_by: 1, store: 1, is_store_product: 1 },
                joinForeignKeys: false
            })

            if (products.success) {
                const productsList: any[] = products.message
                controllers.documentBulkCreate(productsList.map((product => (
                    {
                        schema: "stock",
                        documentData: {
                            createdAt: date,
                            product: product._id,
                            stock: product.stock,
                            branch: product.branch,
                            created_by: product.created_by,
                            store: product.store ? product.store : null,
                            is_store_product: product.is_store_product ? true : false
                        }
                    }
                ))))
            }
        }

    } catch (error) {
        console.log(`Capturing product stock error ${(error as Error).message}`)
    }
}

// Generates reports based on predefined configurations
export const generateReport = async (): Promise<void> => {
    try {
        // Iterate through each report type in the report configuration
        for (const reportType in reportConfig) {
            // Get the configuration for the current report type
            const config = reportConfig[reportType as keyof typeof reportConfig];

            // Iterate through each branch to check for applicable notifications
            for (const branch of await getBranches()) {
                // Check if the branch has the required notification type
                if (branch && array.elementExist(branch.settings.notifications, config.notificationType)) {
                    // Extract closing time information from branch settings
                    const { closing_time } = branch.settings;
                    const shopTime = closing_time?.split(":");
                    const closingHour = Number(shopTime[0]);

                    // Check if the condition for generating the report is met
                    if (config.condition(closingHour)) {
                        // Calculate the date range for the report
                        const dateRange = config.dateFilter();

                        // Check if the date range is valid
                        if (dateRange !== null) {
                            // Generate the report with the specified parameters
                            report({
                                branch,
                                date: dateRange,
                                reportType: config.reportType,
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        // Log any errors that occur during report generation
        console.log(`Report generation error: ${(error as Error).message}`);
    }
}

/**
 * Generates a report for a specific branch and report type based on given options.
 * The report includes various financial metrics and sends a notification via SMS.
 * @param options - The options for generating the report.
 * @param options.branch - The branch for which the report is generated.
 * @param options.reportType - The type of report to be generated.
 * @param options.date - The date range for which the report is generated.
 * @returns A Promise that resolves once the report is generated and the notification is sent.
 */
async function report(options: {
    branch: branch;
    reportType: string;
    date: { $gte: number; $lte: number };
}): Promise<void> {
    try {
        // Sorting order for queries
        const sort = { createdt: -1 };
        const { date, branch, reportType } = options;
        const condition = { branch: branch._id, visible: true };
        const select: object = { total_amount: 1, type: 1, status: 1, paid_amount: 1, sale: 1, service_cost: 1, product_cost: 1, _id: 0 };

        // Define queries for different document types
        const queries: list[] = [
            { sort, select, schema: "debt", condition: { date, ...condition }, joinForeignKeys: false },
            { sort, select, schema: "expense", condition: { date, ...condition }, joinForeignKeys: false },
            { sort, select, schema: "freight", condition: { date, ...condition }, joinForeignKeys: false },
            { sort, select, schema: "quotation_invoice", condition: { date, ...condition }, joinForeignKeys: false },
            { sort, schema: "payment", joinForeignKeys: false, select: { total_amount: 1, _id: 0 }, condition: { ...condition, createdAt: date, status: "active" } },
            {
                sort,
                schema: "sale",
                joinForeignKeys: true,
                condition: { type: "sale", ...condition, createdAt: date, status: { $ne: "invoice" }, fake: { $ne: true } },
                select: { ...select, quantity: 1, product: 1, customer: 0, branch: 0, created_by: 0, updated_by: 0 },
            },
            { sort, select, schema: "truck_order", condition: { date, ...condition }, joinForeignKeys: false },
            { sort, select, schema: "service", condition: { ...condition, createdAt: date }, joinForeignKeys: false },
        ];

        // Retrieve documents based on the defined queries
        const response = await controllers.bulkListAllDocuments(queries);

        if (response.success) {
            const { passedQueries } = response.message;

            if (passedQueries) {
                const { sales, debts, expenses, payments, truck_orders, services, freights, quotation_invoices } = passedQueries;

                // Check if any relevant documents were retrieved
                if (
                    sales?.length ||
                    debts?.length ||
                    expenses?.length ||
                    payments?.length ||
                    truck_orders?.length ||
                    services?.length ||
                    freights?.length ||
                    quotation_invoices?.length
                ) {
                    // Calculate various financial metrics
                    const _sales: number = sales.map((sale: any) => sale.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const _truck_orders: number = truck_orders.map((truck_order: any) => truck_order.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const _quotation_invoices: number = quotation_invoices.map((quotation_invoice: any) => quotation_invoice.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const customerDebts: number = debts.filter((debt: any) => debt.type === "debtor" && !debt.sale).map((debt: any) => debt.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const _services: number = services.map((service: any) => service.service_cost + service.product_cost).reduce((a: number, b: number) => a + b, 0);
                    const revenue: number = _sales + customerDebts + _truck_orders + _services + _quotation_invoices;
                    const _freights: number = freights.map((freight: any) => freight.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const shopPurchases: number = sales.map((sale: any) => sale.quantity * sale.product.buying_price).reduce((a: number, b: number) => a + b, 0) + _freights;
                    const grossProfit: number = revenue - shopPurchases;
                    const shopDebts: number = debts.filter((debt: any) => debt.type === "creditor").map((debt: any) => debt.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const shopPayments: number = payments.map((payment: any) => payment.total_amount).reduce((a: number, b: number) => a + b, 0);
                    const shopExpenses: number = expenses.map((expense: any) => expense.total_amount).reduce((a: number, b: number) => a + b, 0) + shopPayments + shopDebts;
                    const netIncome: number = grossProfit - shopExpenses;

                    // Construct and send the SMS notification
                    const message: string = `${string.removeCase(branch.name, "snake_case").toUpperCase()} ripoti ya ${reportType} (${new Date().toDateString()}).\n1. Mapato (Revenue): ${numeral(revenue).format("0,0")}.\n2. Gharama za ununuzi wa mzigo uliouzwa (COGS): ${numeral(shopPurchases).format(
                        "0,0"
                    )}.\n3. Faida kubwa (Gross profit): ${numeral(grossProfit).format("0,0")}.\n4. Matumizi (Expenses): ${numeral(shopExpenses).format("0,0")}.\n5. Mapato halisi (Net income): ${numeral(netIncome).format("0,0")}.\n${domain}/report/income-statement`;

                    // Receiver phone numbers
                    const receivers: string[] = [`+${branch.phone_number}`];

                    // Send SMS notification
                    sendSMS({
                        message,
                        receivers,
                        vendor: "Smas App",
                        apiKey: emessageAPIKey,
                    });
                }
            }
        }
    } catch (error) {
        // Log any errors that occur during report generation
        console.log(`Report error: ${(error as Error).message}`);
    }
}

export const debtLimitUpdate = async () => {
    try {

        const mwalugajaBranch = "663cab2556b2492c48cbd559"
        const mwalugajaUsers = { branch: mwalugajaBranch }

        // confirming users
        const users = await controllers.listAllDocuments({
            schema: "user",
            select: { _id: 1, username: 1 },
            sort: { username: 1 },
            joinForeignKeys: false,
            condition: mwalugajaUsers,
        })

        if (users.success) {

            for (const user of users.message) {

                // finding debts
                const debts = await controllers.listAllDocuments({
                    schema: "debt",
                    sort: { date: -1 },
                    joinForeignKeys: false,
                    select: { total_amount: 1 },
                    condition: { status: "unpaid", created_by: user._id },
                })

                if (debts.success) {

                    let total_amount = 0

                    for (const debt of debts.message) {
                        total_amount = debt.total_amount + total_amount
                    }

                    // update user data
                    await controllers.updateSingleDocument({
                        schema: "user",
                        condition: { _id: user._id },
                        newDocumentData: {
                            $set: {
                                current_debt_limit: total_amount
                            }
                        }
                    })

                }
            }
        } else {
            // console.log(users.message)
        }

    } catch (error) {
        console.log(`Debt Limit Error: ${(error as Error).message}`)
    }
}

export const deleteNonePrintedOrders = async () => {
    try {

        // find branch
        const branchID = "663cab2556b2492c48cbd559"
        const startDate = new Date("2024-10-20").getTime()
        const branchResult = await controllers.getSingleDocument({
            schema: "branch",
            select: { _id: 1 },
            joinForeignKeys: false,
            condition: { _id: branchID },
        })

        if (branchResult.success) {

            // find branch orders that are not printed  since a given date
            const ordersResult = await controllers.listAllDocuments({
                sort: {},
                schema: "order",
                select: { sales: 1 },
                joinForeignKeys: true,
                condition: { branch: branchID, is_printed: false, created_at: { $gte: startDate } }
            })

            if (ordersResult.success) {

                for (const order of ordersResult.message) {

                    const sales = order.sales

                    const response = await saleController.deleteSale(sales.map((sale: any) => sale._id))

                    if (response.message) {

                        const orderDeleted = await controllers.deleteSingleDocument({
                            schema: "order",
                            condition: { _id: order._id },
                        })

                        console.log(orderDeleted)

                    } else {
                        console.log(response.message)
                    }


                }
            }

        } else {
            console.log(branchResult.message)
        }

    } catch (error) {
        console.log("none printed orders")
        console.log((error as Error).message)
    }
}
