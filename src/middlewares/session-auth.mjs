import passport from "passport";
import APIResponse from "../schemas/api-response.mjs";

export default function (request, response, next) {
	passport.authenticate("local", (error, user) => {
		const res = new APIResponse(200);

		if (error)
			return res
				.setStatusCode(error.statusCode)
				.setMessage(error.message)
				.send(response);
		if (!user)
			return res
				.setStatusCode(401)
				.setMessage("Authenticated failed.")
				.send(response);

		request.logIn(user, (error) => {
			if (error) {
				console.error(error);
				return res
					.setStatusCode(500)
					.setMessage("Signed in failed.")
					.send(response);
			}
			next();
		});
	})(request, response, next);
}
