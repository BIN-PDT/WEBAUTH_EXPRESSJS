import { body } from "express-validator";

export const PasswordChangeSchema = [
	body("oldPassword")
		.isString()
		.withMessage("Password must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Password cannot be empty."),

	body("password")
		.isString()
		.withMessage("Password must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Password cannot be empty."),

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
];
