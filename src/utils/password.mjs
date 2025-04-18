import bcrypt from "bcrypt";

export async function hashPassword(plain) {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(plain, salt);
}

export async function comparePassword(plain, hash) {
	return await bcrypt.compare(plain, hash);
}
