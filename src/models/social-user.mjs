import mongoose from "mongoose";

const SocialUserSchema = new mongoose.Schema(
	{
		email: {
			type: mongoose.Schema.Types.String,
			required: true,
		},

		isActive: {
			type: mongoose.Schema.Types.Boolean,
			default: true,
		},

		provider: {
			type: mongoose.Schema.Types.String,
			required: true,
		},

		userId: {
			type: mongoose.Schema.Types.String,
			required: true,
		},
	},
	{
		toJSON: {
			transform: function (doc, ret) {
				delete ret._id;
				delete ret.__v;
				ret.id = doc._id;
				return ret;
			},
		},
	}
);

export default mongoose.model("SocialUser", SocialUserSchema);
