import { validationResult } from "express-validator";
import { APIResponse } from "../schemas/api-response.mjs";

export function SchemaValidator(request, response, next) {
	const result = validationResult(request);
	if (!result.isEmpty()) {
		const errors = result.array().reduce((acc, err) => {
			const { location, path, msg } = err;

			acc[location] = acc[location] || {};
			acc[location][path] = acc[location][path] || [];
			acc[location][path].push(msg);

			return acc;
		}, {});

		return new APIResponse(400).setErrors(errors).send(response);
	}
	next();
}
