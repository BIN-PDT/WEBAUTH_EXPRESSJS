import passport from "passport";
import { APIResponse } from "../schemas/api-response.mjs";

export function GoogleAuthorize(request, response, next) {
	passport.authenticate("google", {
		scope: ["email", "profile"],
	})(request, response, next);
}

export function GoogleLocalAuth(request, response, next) {
	passport.authenticate("google", (error, user) => {
		if (error) return next(error);
		if (!user)
			return new APIResponse(401)
				.setMessage("Authenticated failed.")
				.send(response);

		request.logIn(user, (error) => next(error));
	})(request, response, next);
}
