import { body } from "express-validator";

export default [
	body("refreshToken")
		.isString()
		.withMessage("Token must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Token cannot be empty."),
];
