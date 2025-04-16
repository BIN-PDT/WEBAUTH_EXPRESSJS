import { Router } from "express";
import { matchedData } from "express-validator";
import APIResponse from "../schemas/api-response.mjs";
import SchemaValidator from "../middlewares/schema-validator.mjs";
import UserSignupSchemaValidation from "../schemas/user-signup.mjs";
import User from "../models/user.mjs";
import { hashPassword } from "../utils/password.mjs";
import SessionAuth from "../middlewares/session-auth.mjs";
import { isSignedIn, isSignedOut } from "../middlewares/check-auth.mjs";

const router = Router();

router.post(
	"/signup",
	UserSignupSchemaValidation,
	SchemaValidator,
	async (request, response) => {
		const cleanedData = matchedData(request);
		const res = new APIResponse(201);

		if (await User.findOne({ username: cleanedData.username }))
			return res
				.setStatusCode(409)
				.setMessage("Username already in use.")
				.send(response);

		try {
			cleanedData.password = await hashPassword(cleanedData.password);
			const newUser = await User.create(cleanedData);
			return res
				.setMessage("Signed up successfully.")
				.setData(newUser)
				.send(response);
		} catch (error) {
			console.error(error);
			return res
				.setStatusCode(500)
				.setMessage("Signed up failed.")
				.send(response);
		}
	}
);

router.post("/signin", isSignedOut, SessionAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/signout", isSignedIn, (request, response) => {
	request.logOut((error) => {
		const res = new APIResponse(200);

		if (error) {
			console.error(error);
			return res
				.setStatusCode(500)
				.setMessage("Signed out failed.")
				.send(response);
		}
		return res.setMessage("Signed out successfully.").send(response);
	});
});

export default router;
