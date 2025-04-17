import passport from "passport";
import APIResponse from "../schemas/api-response.mjs";

export default function (request, response, next) {
	passport.authenticate("local", (error, user) => {
		if (error) return next(error);
		if (!user)
			return new APIResponse(401)
				.setMessage("Authenticated failed.")
				.send(response);

		request.logIn(user, (error) => next(error));
	})(request, response, next);
}
