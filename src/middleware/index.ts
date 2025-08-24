// Importing dependencies
import { time } from "fast-web-kit";
import { controllers, helpers } from "bapig";
import { Response, NextFunction } from "express";

// Constants for paths and account types
const API_ENTRY = "/api";
const ALLOWED_PATHS = [
    `${API_ENTRY}/read`,
    `${API_ENTRY}/custom/zipped-data`,
    `${API_ENTRY}/custom/restore`,
    `${API_ENTRY}/update`,
    `${API_ENTRY}/validate`,
    `${API_ENTRY}/authenticate`,
    `${API_ENTRY}/change-field-encryption`,
    `${API_ENTRY}/create-field-encryption`,
];
const ACCOUNT_TYPES = ["smasapp", "assistance"];

// Helper function to check if a path is allowed
const isPathAllowed = (path: string): boolean => ALLOWED_PATHS.includes(path);

// Helper function to handle responses
const handleResponse = (response: Response, success: boolean, message: string): void => {
    const jsonResponse = helpers.hasEnableEncryption ? helpers.encrypt({ success, message }) : { success, message };
    response.json(jsonResponse);
};

// Helper function to check if the user has a valid account type
const isValidAccountType = (user: any): boolean => ACCOUNT_TYPES.includes(user.account_type);

// Helper function to check if the user is within working hours
const isWithinWorkingHours = (currentHour: number, currentMinute: number, openingHour: number, openingMinute: number, closingHour: number, closingMinute: number): boolean => {
    return (
        (currentHour > openingHour && currentHour < closingHour) ||
        (currentHour === openingHour && currentMinute >= openingMinute) ||
        (currentHour === closingHour && currentMinute <= closingMinute)
    );
};

// server entrance validation
const serverEntrance = async (request: any, response: Response, next: NextFunction) => {
    try {
        const path: string = request.path;

        if (isPathAllowed(path)) {
            next();
            return;
        }

        const { token }: any = request.headers;

        if (!token) {
            handleResponse(response, false, "Authorization failed. Please ensure your account is active and verified.");
            return;
        }

        const _id = helpers.decrypt({ payload: token });
        const userExist = await controllers.getSingleDocument({
            select: {},
            schema: "user",
            condition: { _id },
            joinForeignKeys: true
        });

        if (!userExist.success) {
            handleResponse(response, false, userExist.message);
            return;
        }

        const user = userExist.message;

        if (!user.visible) {
            handleResponse(response, false, "Your account has been disabled. Please contact your administrator for assistance.");
            return;
        }

//if (!user.phone_number_verified) {
//            handleResponse(response, false, "Phone number verification required. Please verify your phone number.");
//            return;
//        }

        if (isValidAccountType(user)) {
            next()
            return;
        }

        if (user.branch) {
            const { opening_time, closing_time } = user.branch?.settings;
            const currentHour = time.currentHour();
            const currentMinute = time.currentMinute();
            const [openingHour, openingMinute] = opening_time?.split(":").map(Number) ?? [];
            const [closingHour, closingMinute] = closing_time?.split(":").map(Number) ?? [];

            if (!isWithinWorkingHours(currentHour, currentMinute, openingHour, openingMinute, closingHour, closingMinute)) {
                handleResponse(response, false, `Shop is currently closed. Working hours are from ${opening_time} to ${closing_time}.`);
                return;
            }
            else if (user.branch?.days <= 0) {
                handleResponse(response, false, `Monthly support fee required for access.`)
                return;
            }

        } else {
            handleResponse(response, false, "Branch information is missing. Please contact support for assistance.");
            return;
        }

        next();
    } catch (error) {
        handleResponse(response, false, "An unexpected error occurred. Please try again later.");
    }
};

export default serverEntrance;
