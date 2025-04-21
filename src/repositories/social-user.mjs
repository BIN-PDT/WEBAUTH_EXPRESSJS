import { SocialUser } from "../models/social-user.mjs";

export class SocialUserRepository {
	static create(data) {
		return SocialUser.create(data);
	}

	static findOne(query) {
		return SocialUser.findOne(query);
	}

	static findById(id) {
		return SocialUser.findById(id);
	}
}
