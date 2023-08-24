import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/shared/SearchBar";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
const Page = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const user = await currentUser();

	if (!user) return null;

	const userInfo = await fetchUser(user.id);

	if (!userInfo?.onboarded) redirect("/onboarding");

	const result = await fetchUsers({
		userId: user.id,
		//PASSING IN THE SEARCH QUERY
		searchString: searchParams.q,
		pageNumber: 1,
		pageSize: 25,
	});

	return (
		<section>
			<h1 className='head-text mb-10'>Search</h1>
			<Searchbar routeType='search' />
			<div className='mt-14 flex flex-col gap-9'>
				{result.users.length === 0 ? (
					<p className='no-result'>No users found</p>
				) : (
					<>
						{result.users.map((person: any) => (
							<UserCard
								key={person.id}
								id={person.id}
								name={person.name}
								username={person.username}
								imageUrl={person.image}
								//DIFFERENTIATE BETWEEN USER AND COMMUNITY
								personType='User'
							/>
						))}
					</>
				)}
			</div>
		</section>
	);
};

export default Page;
