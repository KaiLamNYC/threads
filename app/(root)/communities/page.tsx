import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/shared/SearchBar";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const user = await currentUser();

	if (!user) return null;

	const userInfo = await fetchUser(user.id);

	if (!userInfo?.onboarded) redirect("/onboarding");

	const result = await fetchCommunities({
		searchString: searchParams.q,
		pageNumber: 1,
		pageSize: 25,
	});

	return (
		<section>
			<h1 className='head-text mb-10'>Communities</h1>
			{/* Search Bar */}
			<Searchbar routeType='communities' />

			<div className='mt-14 flex flex-col gap-9'>
				{result.communities.length === 0 ? (
					<p className='no-result'>No communities found</p>
				) : (
					<>
						{result.communities.map((community: any) => (
							<CommunityCard
								key={community.id}
								id={community.id}
								name={community.name}
								username={community.username}
								imgUrl={community.image}
								bio={community.bio}
								members={community.members}
							/>
						))}
					</>
				)}
			</div>
		</section>
	);
};

export default Page;
