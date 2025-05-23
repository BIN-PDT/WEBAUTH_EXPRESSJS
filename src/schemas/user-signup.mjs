import { body } from "express-validator";

export const UserSignupSchema = [
	body("username")
		.isString()
		.withMessage("Username must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Username cannot be empty.")
		.isLength({ max: 150 })
		.withMessage("Username must be at most 150 characters long.")
		.matches(/^[a-zA-Z0-9_@+.-]+$/)
		.withMessage(
			"Username can only contain letters, numbers, _, @, +, ., -."
		),

	body("password")
		.isString()
		.withMessage("Password must be a string.")
		.trim()
		.notEmpty()
		.withMessage("Password cannot be empty.")
		.isLength({ max: 150 })
		.withMessage("Password must be at most 150 characters long."),

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
