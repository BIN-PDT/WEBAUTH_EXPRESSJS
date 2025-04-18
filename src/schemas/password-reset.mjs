import { body } from "express-validator";

export const PasswordResetRequestSchemaValidation = [
	body("email")
		.isString()
		.withMessage("Email must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Email cannot be empty.")
		.isEmail()
		.withMessage("Email must be a valid email address."),
];

export const PasswordResetConfirmSchemaValidation = [
	body("password")
		.isString()
		.withMessage("Password must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Password cannot be empty.")
		.isLength({ max: 150 })
		.withMessage("Password must be at most 150 characters long."),

	body("password2")
		.isString()
		.withMessage("Password must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Password cannot be empty.")
		.custom((value, { req: { body } }) => {
			if (body?.password && value !== body.password)
				throw new Error(
					"Password confirmation does not match password."
				);
			return true;
		}),
	,
];
