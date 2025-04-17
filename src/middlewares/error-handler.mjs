import APIResponse from "../schemas/api-response.mjs";

export default function (error, request, response, next) {
	console.log(error);
	return new APIResponse(500)
		.setMessage("Internal Server Error")
		.send(response);
}
