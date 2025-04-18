import { APIResponse } from "../schemas/api-response.mjs";

export function SignedOutValidator(request, response, next) {
	if (request.isAuthenticated()) {
		return new APIResponse(409)
			.setMessage("User is authenticated.")
			.send(response);
	}
	next();
}

export function SignedInValidator(request, response, next) {
	if (!request.isAuthenticated()) {
		return new APIResponse(401)
			.setMessage("User is not authenticated.")
			.send(response);
	}
	next();
}
