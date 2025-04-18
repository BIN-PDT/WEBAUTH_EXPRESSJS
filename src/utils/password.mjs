import bcrypt from "bcrypt";

export async function hashPassword(plain) {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(plain, salt);
}

export function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}
