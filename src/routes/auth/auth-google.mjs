import { Router } from "express";
import { APIResponse } from "../../schemas/api-response.mjs";
import {
	SignedInValidator,
	SignedOutValidator,
} from "../../middlewares/session-validator.mjs";
import {
	GoogleAuthorize,
	GoogleLocalAuth,
} from "../../middlewares/google-auth.mjs";
import { GoogleUserValidator } from "../../middlewares/social-user-validator.mjs";

export const router = Router();

router.get("/signin", SignedOutValidator, GoogleAuthorize);

router.get(
	"/callback",
	SignedOutValidator,
	GoogleLocalAuth,
	(request, response) => {
		return new APIResponse(200)
			.setMessage("Signed in successfully.")
			.setData(request.user)
			.send(response);
	}
);

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
