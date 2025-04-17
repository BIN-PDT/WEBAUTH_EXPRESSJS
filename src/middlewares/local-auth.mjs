import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import APIResponse from "../schemas/api-response.mjs";
import { createToken } from "../utils/jwt.mjs";

export const SessionLocalAuth = (request, response, next) => {
	passport.authenticate("local", (error, user) => {
		if (error) return next(error);
		if (!user)
			return new APIResponse(401)
				.setMessage("Authenticated failed.")
				.send(response);

		request.logIn(user, (error) => next(error));
	})(request, response, next);
};

export const JWTLocalAuth = (request, response, next) => {
	passport.authenticate("local", (error, user) => {
		if (error) return next(error);
		if (!user)
			return new APIResponse(401)
				.setMessage("Authenticated failed.")
				.send(response);

		const payload = { sub: user.id, jti: uuidv4() };
		request.tokens = {
			accessToken: createToken(payload),
			refreshToken: createToken(payload, "refresh"),
		};
		next();
	})(request, response, next);
};
