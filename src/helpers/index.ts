import fs from "fs"
import zlib from "zlib"
import { branch } from "./activities"
import { controllers, schema } from "bapig"
import { array, string, time, number } from "fast-web-kit"
import { activityType, adjustmentType, sendMessage } from "../types"
import { controllerResponse } from "bapig/dist/types"

const {
    currentDay,
    currentHour,
    currentDate,
    currentYear,
    daysInMonth,
    currentMonth,
    currentMonthName,
} = time


// Middleware events for schema
export const schemaMiddlewareEvents: any = {
    create: "save",
    update: "findOneAndUpdate",
    delete: "findOneAndDelete"
}

// Application domain name
export const domain: string = "https://smas.nexivo.io"

// Emessage API key
export const emessageAPIKey: string = "c13431e1e81ee16e431e1e8c7c3813"

// SMAS app contacts
export const contacts: string = "+255740722007"

// Create activity record
export const createActivity = (activity: activityType) => {
    try {
        controllers.createSingleDocument({
            schema: "activity",
            documentData: {
                data: activity.data,
                user: activity.user,
                type: activity.type,
                module: activity.module,
                branch: activity.branch,
                description: activity.description
            }
        })
    } catch (error) {
        console.log(`Activity creation failed: ${(error as Error).message}`)
    }
}

// Generate activity sentence based on type
export const activitySentence = (type?: "create" | "delete" | "modify"): string => {
    let text: string = "data was deleted temporarily"
    if (type === "create") {
        text = "data was created"
    } else if (type === "delete") {
        text = "data was deleted permanently"
    } else if (type === "modify") {
        text = "data was modified"
    }
    return text
}

// Create system admin account
export const createSystemAccount = async () => {
    try {
        // Check if a system account already exists
        const accountExist = await controllers.getSingleDocument({
            schema: "user",
            select: { _id: 1 },
            joinForeignKeys: false,
            condition: { role: null, account_type: "smasapp", created_by: null },
        })

        if (!accountExist.success) {
            // Create a new system account
            const newAccount = await controllers.createDocumentFieldEncryption({
                schema: "user",
                fieldToEncrypt: "password",
                documentData: {
                    username: "nexivo",
                    account_type: "smasapp",
                    phone_number: "0677004930",
                    phone_number_verified: true,
                    password: "28Shaban",
                    two_factor_authentication_enabled: true
                }
            })

            if (newAccount.success) {
                console.log(`System account has been created`)
            } else {
                console.log(`Failed to create system account: ${newAccount.message}`)
            }
        }
    } catch (error) {
        console.log(`System account creation error ${(error as Error).message}`)
    }
}

// Adjust product stock
export const adjustStock = async (options: adjustmentType) => {
    try {
        // Extract information from options
        const adjustment = options.adjustment // Amount by which stock is adjusted
        const before_adjustment = options.data.product.stock // Stock quantity before adjustment
        const after_adjustment = options.type === "increase" ? adjustment + before_adjustment : before_adjustment - adjustment // Calculate stock quantity after adjustment

        // Determine the module (store or product) for the adjustment
        const module = options.data.product.is_store_product || options.data?.for_store_product ? "store" : "product"

        // Generate adjustment description
        const description: string = `Stock was automatically ${options.type === "increase" ? "increased" : "decreased"} because ${options.from.includes("sale") ? "sale" : string.removeCase(options.from, "snake_case")} was ${(((options.type === "increase") && (options.from.includes("sale"))) || ((options.type === "decrease") && (options.from === "purchase"))) ? "deleted" : "created"}, stock was adjusted from ${before_adjustment} to ${after_adjustment}, stock adjustment was ${adjustment}.`

        const id = options.data._id // ID of the data (e.g., sale, purchase) causing the adjustment

        // Create a record in the "adjustment" collection
        controllers.createSingleDocument({
            schema: "adjustment",
            documentData: {
                module,
                adjustment,
                description,
                after_adjustment,
                before_adjustment,
                category: options.data?.category?._id,
                type: options.type, // Adjustment type (increase or decrease)
                from: options.from, // Source of the adjustment (e.g., sale, purchase)
                branch: options.data.branch._id, // ID of the branch
                user: options.data.created_by._id, // ID of the user who triggered the adjustment
                product: options.data.product._id, // ID of the product being adjusted
                created_by: options.data.created_by._id,
                sale: options.from.includes("sale") ? id : null, // ID of the associated sale (if applicable)
                purchase: options.from === "purchase" ? id : null, // ID of the associated purchase (if applicable)
                service: options.from === "service" ? id : null, // ID of the associated service (if applicable)
            }
        })
    } catch (error) {
        console.log(`Stock adjustment error: ${(error as Error).message}`)
    }
}

// Send text message via emessage
export const sendSMS = async (options: sendMessage): Promise<void> => {
    try {
        console.log(options.receivers)

        const messageSent = await controllers.sendMessage({
            message: options.message,
            receivers: options.receivers,
        })

        console.log(messageSent)

        // if (options.message.trim().length > 0) {
        //     await axios({
        //         data: options,
        //         method: "POST",
        //         url: "https://www.emessage.co.tz/api/send-message"
        //     })
        // }
    } catch (error) {
        console.log(`Sending SMS error: ${(error as Error).message}`)
    }
}



// Get vendor name based on branch
export function getVendorName(branch: branch): string {
    let vendorName: string = "Smas App" // Default vendor name
    try {
        if (branch && branch.api_key && branch.vendor) {
            vendorName = branch.vendor
        }
        return vendorName
    } catch (error) {
        console.log((error as Error).message)
        return vendorName
    }
}

/**
 * Zip the data of a given branch.
 *
 * @param branch - The branch object for which data needs to be zipped.
 * @param fileName - The name of the file where the data will be temporarily stored before zipping.
 * @returns A promise with a controllerResponse object indicating the success status and the zipped data or an error message.
 */
export const zipBranchData = async (branch: any, fileName: string, deleteZip = true): Promise<controllerResponse> => {
    try {
        // Retrieve all database models/schemas
        const databaseModels: controllerResponse = schema.getAllSchema()

        // Check if database models were successfully retrieved
        if (databaseModels.success) {
            const models = databaseModels.message
            // Initialize the structure to store branch data
            const branchData: { branch: object, data: any[] } = { branch, data: [] }

            // Iterate over each model to fetch related data for the branch
            for (const model of models) {
                // Fetch data for the model related to the given branch
                const modelData: any[] = await model.model.find({ branch: branch._id }).lean({ autopopulate: false }).exec()

                // Check if the fetched data is not empty, then add it to the branchData object
                if (!array.isEmpty(modelData))
                    branchData.data.push({ [model.name]: modelData })
            }

            // Write the branch data to a temporary file
            fs.writeFileSync(fileName, JSON.stringify(branchData))

            // Read the temporary file data
            const data: any = fs.readFileSync(fileName)
            // Zip the read data
            const zipped = zlib.gzipSync(data)

            if (deleteZip)
                // Clean up: Delete the temporary file
                fs.unlinkSync(fileName)

            // Return the zipped data with a success status
            return { success: true, message: zipped }
        }

        // If database models were not retrieved successfully, return the error response
        return databaseModels

    } catch (error) {
        // Return an error response in case of any unexpected issues
        return { success: false, message: (error as Error).message }
    }
}


export const unzipBranchData = async (zippedData: any): Promise<controllerResponse> => {
    try {
        // Unzip the data
        const unzipped = zlib.gunzipSync(zippedData)

        // Parse the unzipped data
        const branchData = JSON.parse(unzipped.toString())

        // Retrieve all database models/schemas
        const databaseModels: controllerResponse = schema.getAllSchema()

        // Check if database models were successfully retrieved
        if (databaseModels.success) {
            const models = databaseModels.message

            // Iterate over each model and insert data back into the database
            for (const modelData of branchData.data) {
                const modelName = Object.keys(modelData)[0]
                const data = modelData[modelName]

                // Find the corresponding model
                const model = models.find((m: any) => m.name === modelName)

                // Check if model exists
                if (model) {

                    // Update the branch reference for each document
                    const updatedData = data.map((doc: any) => ({ ...doc }))

                    console.log(updatedData)

                    // Insert data for the model
                    // await model.model.insertMany(updatedData)
                }
            }

            // Return a success response
            return { success: true, message: 'Data successfully imported into the database.' }
        }

        // If database models were not retrieved successfully, return the error response
        return databaseModels

    } catch (error) {
        // Return an error response in case of any unexpected issues
        return { success: false, message: (error as Error).message }
    }
}

// Report Configuration
export const reportConfig = {
    daily: {
        // Type of notification for the daily report
        notificationType: "daily_report",
        // Type of report for the daily report
        reportType: "siku",
        // Condition function for the daily report
        condition: (closingHour: number) => closingHour === currentHour(),
        // Date filter for the daily report
        dateFilter: () => ({
            $gte: new Date().setHours(0, 0, 0, 0),
            $lte: new Date().setHours(23, 59, 59, 999),
        }),
    },
    annual: {
        // Type of notification for the annual report
        notificationType: "annual_report",
        // Type of report for the annual report
        reportType: `mwaka ${new Date().getFullYear()}`,
        // Condition function for the annual report
        condition: (closingHour: number) =>
            closingHour === currentHour() && daysInMonth() === currentDate() && currentMonth() === 11,
        // Date filter for the annual report
        dateFilter: () => {
            if (currentHour() === currentHour() && daysInMonth() === currentDate() && currentMonth() === 11) {
                // Calculate start and end dates for the annual report
                const startDate = new Date(`01-01-${currentYear()}`).setHours(0, 0, 0, 0);
                const endDate = new Date(`12-31-${currentYear()}`).setHours(23, 59, 59, 999);
                return { $gte: startDate, $lte: endDate };
            }
            return null;
        },
    },
    monthly: {
        // Type of notification for the monthly report
        notificationType: "monthly_report",
        // Type of report for the monthly report
        reportType: `mwezi ${currentMonthName()}`,
        // Condition function for the monthly report
        condition: (closingHour: number) => closingHour === currentHour() && currentDate() === daysInMonth(),
        // Date filter for the monthly report
        dateFilter: () => {
            if (currentHour() === currentHour() && currentDate() === daysInMonth()) {
                // Calculate start and end dates for the monthly report
                const startDate = new Date(`${currentMonth() + 1}-01-${currentYear()}`).setHours(0, 0, 0, 0);
                const endDate = new Date(`${currentMonth() + 1}-${daysInMonth()}-${currentYear()}`).setHours(23, 59, 59, 999);
                return { $gte: startDate, $lte: endDate };
            }
            return null;
        },
    },
    weekly: {
        // Type of notification for the weekly report
        notificationType: "weekly_report",
        // Type of report for the weekly report
        reportType: "wiki",
        // Condition function for the weekly report
        condition: (closingHour: number) => closingHour === currentHour() && currentDay() === 0,
        // Date filter for the weekly report
        dateFilter: () => {
            if (currentHour() === currentHour() && currentDay() === 0) {
                // Calculate start and end dates for the weekly report
                const fullDate = new Date(`${currentMonth() + 1}-${currentDate()}-${currentYear()}`);
                const startDate = fullDate.setHours(0, 0, 0, 0) - number.toMilliseconds(6, "days");
                const endDate = fullDate.setHours(23, 59, 59, 999);
                return { $gte: startDate, $lte: endDate };
            }
            return null;
        },
    },
};

export const databaseCollections: string[] = [
    'debts',
    'roles',
    'sales',
    'users',
    'stores',
    'orders',
    'branches',
    'expenses',
    'payments',
    'products',
    'categories',
    'suppliers',
    'customers',
    'activities',
    'purchases',
    'adjustments',
    'debt_histories',
    'expense_types'
]
