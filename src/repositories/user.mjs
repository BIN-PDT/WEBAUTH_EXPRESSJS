import { User } from "../models/user.mjs";

export class UserRepository {
	static create(data) {
		return User.create(data);
	}

	static deleteOne(query) {
		return User.deleteOne(query);
	}

	static findOne(query) {
		return User.findOne(query);
	}

	static findById(id) {
		return User.findById(id);
	}
}
