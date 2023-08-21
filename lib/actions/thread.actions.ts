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
