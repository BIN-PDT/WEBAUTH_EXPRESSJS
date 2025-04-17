import passport from "passport";
import APIResponse from "../schemas/api-response.mjs";
import { createTokenPair } from "../utils/jwt.mjs";

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

		request.user = { ...createTokenPair(user), user };
		next();
	})(request, response, next);
};
