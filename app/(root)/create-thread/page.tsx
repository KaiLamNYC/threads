import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
	const user = await currentUser();

	if (!user) return null;

	//GRABBING USER INFO FROM MONGODB PASSING IN THE CLERK USER ID
	//NOT TO BE MISTAKEN WITH _ID. USER MODEL HAS BOTH _ID AND ID. ONE IS CLERK OTHER IS MONGO OBJ ID
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
