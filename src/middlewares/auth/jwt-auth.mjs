import passport from "passport";
import { APIResponse } from "../../schemas/api-response.mjs";
import { createAuthToken } from "../../utils/token.mjs";

export function JWTLocalAuth(request, response, next) {
	passport.authenticate("local", (error, user) => {
		if (error) return next(error);
		if (!user)
			return new APIResponse(401)
				.setMessage("Authenticated failed.")
				.send(response);

		request.user = { ...createAuthToken(user), user };
		next();
	})(request, response, next);
}

export function JWTAuth(request, response, next) {
	passport.authenticate(
		"jwt",
		{ session: false },
		(error, { payload, user }) => {
			if (error) return next(error);
			if (!user)
				return new APIResponse(401)
					.setMessage("Authenticated failed.")
					.send(response);

			request.payload = payload;
			request.user = user;
			next();
		}
	)(request, response, next);
}
