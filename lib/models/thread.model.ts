import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
	text: { type: String, required: true },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	community: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Community",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	//IF THREAD IS A COMMENT ON ANOTHER THREAD
	parentId: {
		type: String,
	},
	//COMMENTS ON THE THREAD
	children: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Thread",
		},
	],
});

//IF DOESNT EXIST IN DB THEN IT CREATES THE MODEL OTHERWISE JUST READS FROM DB
const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
