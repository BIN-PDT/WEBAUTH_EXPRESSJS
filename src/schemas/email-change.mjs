import { body } from "express-validator";

export const EmailChangeSchemaValidation = [
	body("email")
		.isString()
		.withMessage("Email must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Email cannot be empty.")
		.isLength({ max: 150 })
		.withMessage("Email must be at most 150 characters long.")
		.isEmail()
		.withMessage("Email must be a valid email address."),
];
