import { Router } from "express";
import { matchedData } from "express-validator";
import APIResponse from "../schemas/api-response.mjs";
import SchemaValidator from "../middlewares/schema-validator.mjs";
import UserSignupSchemaValidation from "../schemas/user-signup.mjs";
import User from "../models/user.mjs";
import RevokedToken from "../models/revoked-token.mjs";
import { hashPassword } from "../utils/password.mjs";
import { SessionLocalAuth, JWTLocalAuth } from "../middlewares/local-auth.mjs";
import JWTAuth from "../middlewares/jwt-auth.mjs";
import { IsSignedIn, IsSignedOut } from "../middlewares/check-auth.mjs";

const router = Router();

router.post(
	"/signup",
	UserSignupSchemaValidation,
	SchemaValidator,
	async (request, response, next) => {
		const cleanedData = matchedData(request);
		const res = new APIResponse(201);

		try {
			if (await User.findOne({ username: cleanedData.username }))
				return res
					.setStatusCode(409)
					.setMessage("Username already in use.")
					.send(response);

			cleanedData.password = await hashPassword(cleanedData.password);
			const newUser = await User.create(cleanedData);
			return res
				.setMessage("Signed up successfully.")
				.setData(newUser)
				.send(response);
		} catch (error) {
			next(error);
		}
	}
);

router.post("/signin", IsSignedOut, SessionLocalAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/signout", IsSignedIn, (request, response, next) => {
	request.logOut((error) => {
		if (error) return next(error);
		return new APIResponse(200)
			.setMessage("Signed out successfully.")
			.send(response);
	});
});

router.post("/jwt/signin", JWTLocalAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.tokens)
		.send(response);
});

router.get("/jwt/signout", JWTAuth, (request, response, next) => {
	const { payload } = request;

	const expiresAt = new Date(payload.exp * 1000);
	RevokedToken.create({ jti: payload.jti, expiresAt: expiresAt })
		.then((_) =>
			new APIResponse(200)
				.setMessage("Signed out successfully.")
				.send(response)
		)
		.catch((error) => next(error));
});

export default router;
