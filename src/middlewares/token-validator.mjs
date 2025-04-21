import { APIResponse } from "../schemas/api-response.mjs";
import { UserRepository } from "../repositories/user.mjs";
import { findRevokedToken, decodeToken } from "../utils/token.mjs";

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

	try {
		const token = await findRevokedToken(data.jti);
		if (token)
			return res
				.setStatusCode(400)
				.setMessage("Link has been used.")
				.send(response);

		const user = await UserRepository.findById(data.sub);
		if (!user)
			return res
				.setStatusCode(404)
				.setMessage("User not found.")
				.send(response);

		request.payload = data;
		request.user = user;
		next();
	} catch (error) {
		next(error);
	}
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
