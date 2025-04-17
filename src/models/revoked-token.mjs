import mongoose from "mongoose";

const RevokedTokenSchema = new mongoose.Schema({
	jti: {
		type: mongoose.Schema.Types.String,
		required: true,
		unique: true,
	},

	revokedAt: {
		type: mongoose.Schema.Types.Date,
		default: Date.now,
	},

	expiresAt: {
		type: mongoose.Schema.Types.Date,
		index: { expires: "0s" },
	},
});

export default mongoose.model("RevokedToken", RevokedTokenSchema);
