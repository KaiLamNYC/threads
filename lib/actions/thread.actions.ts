"use server";
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

import { revalidatePath } from "@/node_modules/next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
	text: string;
	author: string;
	communityId: string | null;
	path: string;
}

export async function createThread({
	text,
	author,
	communityId,
	path,
}: Params) {
	try {
		connectToDB();

		const createdThread = await Thread.create({
			text,
			author,
			community: null,
		});
		//ADDING THREAD TO USER
		await User.findByIdAndUpdate(author, {
			//PUSHING THE ID TO THE USER
			// https://www.mongodb.com/docs/manual/reference/operator/update/push/
			$push: { threads: createdThread._id },
		});
		revalidatePath(path);
	} catch (e: any) {
		throw new Error(`error creating thread ${e.message}`);
	}
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
	connectToDB();

	//CALCULATE THE NUMBER OF POSTS TO SKIP DEPENDING ON WHAT PAGE WERE ON
	//pageNumber - 1 because we want to display the 5th page so skip 5-1 amount
	const skipAmount = (pageNumber - 1) * pageSize;

	//FETCHING THREADS THAT HAVE NO PARENTS (TOP LEVEL THREADS)
	//THREADS WITH PARENTS ARE COMMENTS
	// https://www.mongodb.com/docs/manual/reference/operator/query/in/
	const threadsQuery = Thread.find({
		parentId: { $in: [null, undefined] },
	})
		.sort({ createdAt: "desc" })
		.skip(skipAmount)
		.limit(pageSize)
		.populate({ path: "author", model: User })
		.populate({
			path: "children",
			populate: {
				path: "author",
				model: User,
				select: "_id name parentId image",
			},
		});

	//COUNTING TOTAL NUMBER OF THREADS IN DB NOT INCLUDING COMMENTS/CHILDREN
	const totalThreadsCount = await Thread.countDocuments({
		parentId: { $in: [null, undefined] },
	});

	//EXECUTING RETRIEVAL OF DOCUMENTS
	const threads = await threadsQuery.exec();

	//FINDING IF THERE ARE MORE THREADS FOR A NEXT PAGE
	//TOTAL THREADS GREATER THAN SKIP AMOUNT + QUERIED THREADS
	const isNext = totalThreadsCount > skipAmount + threads.length;

	//RETURNING ALL THREADS + BOOLEAN
	return { threads, isNext };
}

export async function fetchThreadsById(id: string) {
	connectToDB();
	try {
		//POPULATE COMMUNITY MODEL
		const thread = await Thread.findById(id)
			.populate({
				path: "author",
				model: User,
				select: "_id id name image",
			})
			.populate({
				//COMMENTS AND USER INFO FOR COMMENTS
				path: "children",
				//ARRAY OF THE AUTHOR AND THE THREAD
				populate: [
					{
						path: "author",
						model: "User",
						select: "_id id name parentId image",
					},
					{
						path: "children",
						model: "Thread",
						//GRABBING THE REPLIES ON THE COMMENTS WITHIN THE PARENT THREAD
						populate: {
							path: "author",
							model: User,
							select: "_id id name parentId image",
						},
					},
				],
			})
			.exec();
		return thread;
	} catch (e: any) {
		throw new Error(`Could not find thread ${e}`);
	}
}

export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string
) {
	connectToDB();
	try {
		const originalThread = await Thread.findById(threadId);
		if (!originalThread) {
			throw new Error("Thread not found");
		}

		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId,
		});

		const savedCommentThread = await commentThread.save();

		//adding comment to parent thread
		originalThread.children.push(savedCommentThread._id);

		await originalThread.save();

		//DONT NEED TO ADD TO USER DOC BECAUSE ITS A COMMENT NOT A PARENT THREAD
		//UNLESS WANT TO TRACK COMMENTS FOR SOME REASON
	} catch (e) {
		throw new Error(`Could not comment on thread${e}`);
	}
}
