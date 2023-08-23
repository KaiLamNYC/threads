"use client";

import { sidebarLinks } from "@/constants";
import { SignedIn, SignOutButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function LeftSidebar() {
	const router = useRouter();
	//PATHNAME RETURNS STRING OF CURRENT URL
	const pathname = usePathname();

	const { userId } = useAuth();
	return (
		<section className='custom-scrollbar leftsidebar'>
			<div className='flex w-full flex-col gap-6 px-6'>
				{/* MAPPING OVER LINKS FROM CONSTANTS */}
				{sidebarLinks.map((link) => {
					//CHECKING WHICH LINK IS CURRENTLY BEING VIEWED
					const isActive =
						(pathname.includes(link.route) && link.route.length > 1) ||
						pathname === link.route;

					if (link.route === "/profile") link.route = `${link.route}/${userId}`;
					return (
						// LEFTSIDEBAR_LINK CLASS HIDES LINK ON MOBILE
						<Link
							href={link.route}
							key={link.label}
							//TERNARY TO HIGHLIGHT CURRENT LINK
							className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
						>
							<Image
								src={link.imgURL}
								alt={link.label}
								width={24}
								height={24}
							/>
							{/* HIDDEN LABEL ON MEDIUM SCREEN */}
							<p className='text-light-1 max-lg:hidden'>{link.label}</p>
						</Link>
					);
				})}
			</div>
			{/* HIDDEN ON MOBILE */}
			<div className='mt-10 px-6'>
				<SignedIn>
					<SignOutButton
						//AFTER SIGN-OUT REDIRECT TO SIGN-IN
						signOutCallback={() => router.push("/sign-in")}
					>
						<div className='flex cursor-pointer gap-4 p-4'>
							<Image
								src='/assets/logout.svg'
								alt='logout'
								width={24}
								height={24}
							/>
							<p className='text-light-2 max-lg:hidden'>Logout</p>
						</div>
					</SignOutButton>
				</SignedIn>
			</div>
		</section>
	);
}

export default LeftSidebar;
