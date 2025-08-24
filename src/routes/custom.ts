// dependencies
import { Router, Request, Response } from "express"
import { zipBranchData } from "../helpers"
import { controllerResponse } from "bapig/dist/types"
import { controllers, schema } from "bapig"
import { array } from "fast-web-kit"

const router: Router = Router()

// Endpoint to retrieve zipped data for a given branch
router.get("/zipped-data", async (request: Request, response: Response) => {
    try {
        const { branch }: any = request.query;

        // Check if the provided branch ID exists in the database
        const branchExist: controllerResponse = await controllers.getSingleDocument({
            select: {},
            schema: "branch",
            condition: { _id: branch },
            joinForeignKeys: false,
        });

        // If the branch exists, proceed to fetch and zip the data
        if (branchExist.success) {
            const branch = branchExist.message;

            // Construct the filename based on branch details
            const fileName: string = `${branch.name}_${branch.phone_number}_${branch.address.region}`;

            // Zip the branch data
            const result: controllerResponse = await zipBranchData(branch, fileName);

            // If zipping was successful, send the zipped data as a response
            if (result.success) {
                response.setHeader('Content-Type', 'application/gzip');
                response.setHeader('Content-Disposition', `attachment; filename=${fileName}.gz`);
                response.send(result.message);
                return;
            }
            // If zipping failed, return the error message
            else {
                return response.json(result);
            }
        }

        // If the branch does not exist, return the result of the existence check
        return response.json(branchExist);

    } catch (error) {
        // Handle any unexpected errors and send a 200 status with the error message
        // (Note: It's unusual to send a 200 status for errors; you might want to consider using another status like 500)
        return response.status(200).json({ success: false, message: (error as Error).message });
    }
});

router.post("/restore", async (request: any, response: Response) => {
    try {

        const file = request.files.file

        if (file) {

            if (file.mimetype !== "application/json") {
                return response.status(400).json({ success: false, message: "Please upload a valid JSON file." });
            }

            // Read the JSON file content
            const branchData = JSON.parse(file.data.toString());
            const databaseModels = schema.getAllSchema()

            if (databaseModels.success) {

                const models = databaseModels.message

                const branchSchema = schema.getSingleSchema("branch")

                if (branchSchema.success) {

                    const branchModel = branchSchema.message

                    branchModel.insertMany([branchData.branch])

                    for (const modelData of branchData.data) {

                        const modelName = Object.keys(modelData)[0]

                        const data = modelData[modelName]

                        // Find the corresponding model
                        const model = models.find((m: any) => m.name === modelName)

                        // Check if model exists
                        if (model && array.hasElements(data) && (modelName !== "activity")) {

                            // Update the branch reference for each document
                            // const updatedData = data.map((doc: any) => ({ ...doc }))

                            // Insert data for the model
                            await model.model.insertMany(data)

                            console.log("data has been inserted")
                        }

                    }

                    return response.status(200).json({ success: true, message: "backup has been restored" })

                } else {
                    return response.status(200).json(branchSchema)
                }

            } else {
                return response.status(200).json(databaseModels)
            }

        } else {
            return response.status(200).json({ success: false, message: "No file has been provided" })
        }


    } catch (error) {
        return response.status(200).json({ success: false, message: (error as Error).message })
    }
})


export default router