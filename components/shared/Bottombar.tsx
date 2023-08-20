"use client";

import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// BOTTOM BAR USED FOR MOBILE VIEW
function Bottombar() {
	const pathname = usePathname();
	const router = useRouter();
	return (
		<section className='bottombar'>
			<div className='bottombar_container'>
				{sidebarLinks.map((link) => {
					//CHECKING WHICH LINK IS CURRENTLY BEING VIEWED
					const isActive =
						(pathname.includes(link.route) && link.route.length > 1) ||
						pathname === link.route;
					return (
						<Link
							href={link.route}
							key={link.label}
							//TERNARY TO HIGHLIGHT CURRENT LINK
							className={`bottombar_link ${isActive && "bg-primary-500"}`}
						>
							<Image
								src={link.imgURL}
								alt={link.label}
								width={24}
								height={24}
							/>
							{/* LABEL ONLY ON VISIBLE SMALL/TABLET SCREENS */}
							<p className='text-subtle-medium text-light-1 max-sm:hidden'>
								{/* GRABBING THE FIRST WORD OF THE LABEL, SAME AS BELOW*/}
								{/* {link.label.split(" ")[0]} */}
								{link.label.split(/\s+/)[0]}
							</p>
						</Link>
					);
				})}
			</div>
		</section>
	);
}

export default Bottombar;
