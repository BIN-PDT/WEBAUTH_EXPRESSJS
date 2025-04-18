import { APIResponse } from "../schemas/api-response.mjs";
import { User } from "../models/user.mjs";
import { decodeToken } from "../utils/jwt.mjs";

export function MailTokenValidator(request, response, next) {
	const { params } = request;
	const res = new APIResponse(200);

	const { error, data } = decodeToken(params.token);
	if (error) return next(error);
	if (data.type != "mail")
		return res
			.setStatusCode(400)
			.setMessage("Invalid credentials.")
			.send(response);

	User.findById(data.sub)
		.then((user) => {
			if (!user)
				return res
					.setStatusCode(404)
					.setMessage("User not found.")
					.send(response);

			request.user = user;
			next();
		})
		.catch((error) => next(error));
}
