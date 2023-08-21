import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
	const user = await currentUser();

	if (!user) return null;

	//GRABBING USER INFO FROM DB
	const userInfo = await fetchUser(user.id);

	//IF USER HASNT ONBOARDED YET
	if (!userInfo?.onboarded) redirect("/onboarding");

	return (
		<>
			<h1 className='head-text'>Create Thread</h1>
			<PostThread userId={userInfo._id} />
		</>
	);
}
export default Page;
