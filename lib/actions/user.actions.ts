"use server";

import { revalidatePath } from "@/node_modules/next/cache";
import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

interface Params {
	userId: string;
	username: string;
	name: string;
	bio: string;
	image: string;
	path: string;
}

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path,
}: Params): Promise<void> {
	try {
		//CONNECTING TO DB
		connectToDB();

		await User.findOneAndUpdate(
			{ id: userId },
			{
				username: username.toLowerCase(),
				name,
				bio,
				image,
				onboarded: true,
			},
			//UPDATE AND INSERT
			{ upsert: true }
		);

		// https://nextjs.org/docs/app/api-reference/functions/revalidatePath
		// CHECKING WHERE THE REQUEST CAME FROM TO REDIRECT LATER
		if (path === "/profile/edit") {
			revalidatePath(path);
		}
	} catch (err: any) {
		throw new Error(`failed to create/update user: ${err.message}`);
	}
}

export async function fetchUser(userId: string) {
	try {
		connectToDB();

		return await User.findOne({ id: userId });

		//GRABBING THE USERS REF
		// .populate({
		// 	path: "communities",
		// 	model: Community,
		// });
	} catch (err: any) {
		throw new Error(`failed to fetch user: ${err.message}`);
	}
}

export async function fetchUserThreads(userId: string) {
	try {
		connectToDB();
		//GRABBING THE THREADS. NEED TO ADD COMMUNITIES LATER
		const threads = await User.findOne({ id: userId }).populate({
			path: "threads",
			model: Thread,
			//GRABBING COMMENTS ON THE THREAD AND THEIR AUTHORS
			populate: {
				path: "children",
				model: "Thread",
				populate: {
					path: "author",
					model: "User",
					select: "name image id",
				},
			},
		});

		return threads;
	} catch (err: any) {
		throw new Error(`Failed to fetch user posts: ${err.message}`);
	}
}

export async function fetchUsers({
	userId,
	searchString = "",
	pageNumber = 1,
	pageSize = 20,
	sortBy = "desc",
}: {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	//MONGOOSE TYPE SORTORDER NODE_MODULES/MONGOOSE/TYPES/INDEX.TS/LINE 580
	sortBy?: SortOrder;
}) {
	try {
		connectToDB();

		//PAGINATION STUFF FOR SEARCH RESULTS
		const skipAmount = (pageNumber - 1) * pageSize;

		const regex = new RegExp(searchString, "i");

		//GRABBING ALL USERS EXCEPT CURRENT USER FOR SEARCH
		const query: FilterQuery<typeof User> = {
			// https://www.mongodb.com/docs/manual/reference/operator/query/ne/
			//THIS IS CLERK ID NOT MONGOID. BASICALLY SAME THING SINCE ONLY FILTERING
			id: { $ne: userId },
		};

		if (searchString.trim() !== "") {
			// https://www.mongodb.com/docs/manual/reference/operator/query/or/
			query.$or = [
				{ username: { $regex: regex } },
				{ name: { $regex: regex } },
			];
		}

		const sortOptions = { createdAt: sortBy };

		//PERFORMING THE QUERY WITH ALL THE OPTIONS BELOW
		//SEARCHING BY USERID, USERNAME OR NAME AS WRITTEB ABOVE
		const usersQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize);

		const totalUsersCount = await User.countDocuments(query);

		const users = await usersQuery.exec();

		const isNext = totalUsersCount > skipAmount + users.length;
		return { users, isNext };
	} catch (err: any) {
		throw new Error(`failed to fetch users: ${err.message}`);
	}
}

export async function getActivity(userId: string) {
	try {
		connectToDB();

		//GRABBING ALL USER THREADS
		const userThreads = await Thread.find({ author: userId });

		//GRABBING ALL COMMENTS ON USERS THREADS
		//ITERATING OVER ALL THREADS AND CONCATING CHILDRENID TO ACCUMULATOR ARRAY
		const childThreadIds = userThreads.reduce((acc: any, userThread: any) => {
			return acc.concat(userThread.children);
		}, []);

		//USING CHILDTHREADIDS ABOVE TO GRAB ALL OF THE ACTUAL COMMENTS EXCLUDING COMMENTS MADE BY CURRENTUSER
		const replies = await Thread.find({
			_id: { $in: childThreadIds },
			author: { $ne: userId },
		}).populate({
			path: "author",
			model: User,
			select: "name image _id",
		});

		//RETURNING ALL REPLIES/COMMENTS MADE ON ALL USERS POSTS
		return replies;
	} catch (err: any) {
		throw new Error(`failed to get users activity: ${err.message}`);
	}
}
