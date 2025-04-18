export class APIResponse {
	constructor(statusCode) {
		this.statusCode = statusCode;
		this.message = null;
		this.data = null;
		this.errors = null;
	}

	setStatusCode(value) {
		this.statusCode = value;
		return this;
	}

	setMessage(value) {
		this.message = value;
		return this;
	}

	setData(value) {
		this.data = value;
		return this;
	}

	setErrors(value) {
		this.errors = value;
		return this;
	}

	send(response) {
		return response.status(this.statusCode).json({
			statusCode: this.statusCode,
			message: this.message,
			data: this.data,
			errors: this.errors,
		});
	}
}
