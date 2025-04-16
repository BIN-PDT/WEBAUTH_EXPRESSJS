import APIResponse from "../schemas/api-response.mjs";

export function isSignedOut(request, response, next) {
	if (request.isAuthenticated()) {
		return new APIResponse(409)
			.setMessage("User is authenticated.")
			.send(response);
	}
	next();
}

export function isSignedIn(request, response, next) {
	if (!request.isAuthenticated()) {
		return new APIResponse(401)
			.setMessage("User is not authenticated.")
			.send(response);
	}
	next();
}
