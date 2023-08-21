"use server";

import { revalidatePath } from "@/node_modules/next/cache";
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
