import { APIResponse } from "../schemas/api-response.mjs";

export function LocalUserValidator(request, response, next) {
	if (request.user.provider) {
		return new APIResponse(403)
			.setMessage("User doesnot have permission.")
			.send(response);
	}
	next();
}

function SocialUserValidator(provider) {
	return (request, response, next) => {
		if (request.user.provider != provider) {
			return new APIResponse(403)
				.setMessage("User doesnot have permission.")
				.send(response);
		}
		next();
	};
}

export const GoogleUserValidator = SocialUserValidator("google");
