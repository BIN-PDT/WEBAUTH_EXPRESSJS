import { APIResponse } from "../schemas/api-response.mjs";
import { User } from "../models/user.mjs";
import { checkRevokedToken, decodeToken } from "../utils/jwt.mjs";

export async function MailTokenValidator(request, response, next) {
	const { params } = request;
	const res = new APIResponse(200);

	const { error, data } = decodeToken(params.token);
	if (error) return next(error);
	if (data.type != "mail")
		return res
			.setStatusCode(400)
			.setMessage("Invalid credentials.")
			.send(response);

	const result = await checkRevokedToken(data.jti);
	if (result.error) return next(error);
	if (result.data)
		return res
			.setStatusCode(400)
			.setMessage("Link has been used.")
			.send(response);

	User.findById(data.sub)
		.then((user) => {
			if (!user)
				return res
					.setStatusCode(404)
					.setMessage("User not found.")
					.send(response);

			request.payload = data;
			request.user = user;
			next();
		})
		.catch((error) => next(error));
}

export function RefreshTokenValidator(request, response, next) {
	const {
		body: { refreshToken },
		payload: accessPayload,
	} = request;

	const { error, data: refreshPayload } = decodeToken(refreshToken);
	if (error) return next(error);

	if (
		refreshPayload.type != "refresh" ||
		refreshPayload.jti != accessPayload.jti ||
		refreshPayload.sub != accessPayload.sub
	)
		return new APIResponse(400)
			.setMessage("Invalid credentials.")
			.send(response);

	next();
}
