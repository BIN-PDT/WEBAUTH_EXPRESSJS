import { RevokedToken } from "../models/revoked-token.mjs";

export class RevokedTokenRepository {
	static create(data) {
		return RevokedToken.create(data);
	}

	static findOne(query) {
		return RevokedToken.findOne(query);
	}
}
