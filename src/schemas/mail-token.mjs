import { param } from "express-validator";

export const MailTokenSchemaValidation = [
	param("token")
		.isString()
		.withMessage("Token must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Token cannot be empty."),
];
