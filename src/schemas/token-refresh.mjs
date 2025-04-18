import { body } from "express-validator";

export const TokenRefreshSchemaValidation = [
	body("refreshToken")
		.isString()
		.withMessage("Token must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Token cannot be empty."),
];
