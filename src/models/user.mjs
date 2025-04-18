import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: mongoose.Schema.Types.String,
			required: true,
			unique: true,
			maxlength: 150,
		},

		password: {
			type: mongoose.Schema.Types.String,
			required: true,
			maxlength: 150,
		},

		isActive: {
			type: mongoose.Schema.Types.Boolean,
			default: true,
		},

		email: {
			type: mongoose.Schema.Types.String,
			required: true,
			unique: true,
			maxlength: 150,
		},

		isVerified: {
			type: mongoose.Schema.Types.Boolean,
			default: false,
		},
	},
	{
		toJSON: {
			transform: function (doc, ret) {
				delete ret._id;
				delete ret.__v;
				delete ret.password;
				ret.id = doc._id;
				return ret;
			},
		},
	}
);

export const User = mongoose.model("User", UserSchema);
