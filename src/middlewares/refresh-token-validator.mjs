import APIResponse from "../schemas/api-response.mjs";
import { decodeToken } from "../utils/jwt.mjs";

export default function (request, response, next) {
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
