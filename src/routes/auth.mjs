import { Router } from "express";
import { matchedData } from "express-validator";
import APIResponse from "../schemas/api-response.mjs";
import SchemaValidator from "../middlewares/schema-validator.mjs";
import UserSignupSchemaValidation from "../schemas/user-signup.mjs";
import TokenRefreshSchemaValidation from "../schemas/token-refresh.mjs";
import User from "../models/user.mjs";
import { hashPassword } from "../utils/password.mjs";
import { createTokenPair, revokeToken } from "../utils/jwt.mjs";
import { SessionLocalAuth, JWTLocalAuth } from "../middlewares/local-auth.mjs";
import JWTAuth from "../middlewares/jwt-auth.mjs";
import { GoogleLocalAuth, GoogleAuth } from "../middlewares/google-auth.mjs";
import { IsSignedIn, IsSignedOut } from "../middlewares/session-validator.mjs";
import RefreshTokenValidator from "../middlewares/refresh-token-validator.mjs";

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
		.setData(request.user)
		.send(response);
});

router.get("/jwt/signout", JWTAuth, async (request, response, next) => {
	const { payload } = request;

	const { error } = await revokeToken(payload);
	if (error) return next(error);
	return new APIResponse(200)
		.setMessage("Signed out successfully.")
		.send(response);
});

router.post(
	"/jwt/refresh",
	JWTAuth,
	TokenRefreshSchemaValidation,
	SchemaValidator,
	RefreshTokenValidator,
	(request, response, next) => {
		const { user, payload: accessPayload } = request;

		const { error } = revokeToken(accessPayload);
		if (error) return next(error);

		const tokenPair = createTokenPair(user);
		return new APIResponse(200)
			.setMessage("Refreshed tokens successfully.")
			.setData(tokenPair)
			.send(response);
	}
);

router.get("/google/signin", IsSignedOut, GoogleLocalAuth);

router.get("/google/callback", IsSignedOut, GoogleAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get("/google/signout", IsSignedIn, (request, response, next) => {
	request.logOut((error) => {
		if (error) return next(error);
		return new APIResponse(200)
			.setMessage("Signed out successfully.")
			.send(response);
	});
});

export default router;
