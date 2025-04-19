import { Router } from "express";
import { APIResponse } from "../../schemas/api-response.mjs";
import {
	SignedInValidator,
	SignedOutValidator,
} from "../../middlewares/session-validator.mjs";
import { GoogleAuth, GoogleLocalAuth } from "../../middlewares/google-auth.mjs";
import { GoogleUserValidator } from "../../middlewares/social-user-validator.mjs";

export const router = Router();

router.get("/signin", SignedOutValidator, GoogleLocalAuth);

router.get("/callback", SignedOutValidator, GoogleAuth, (request, response) => {
	return new APIResponse(200)
		.setMessage("Signed in successfully.")
		.setData(request.user)
		.send(response);
});

router.get(
	"/signout",
	SignedInValidator,
	GoogleUserValidator,
	(request, response, next) => {
		request.logOut((error) => {
			if (error) return next(error);

			return new APIResponse(200)
				.setMessage("Signed out successfully.")
				.send(response);
		});
	}
);
