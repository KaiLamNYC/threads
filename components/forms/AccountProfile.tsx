"use client";
//FORM TO SAVE THE USERS DATA

//FORM LAYOUT FROM SHADCN
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
//ZOD HANDLES VALIDATION
import { UserValidation } from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
//HANDLES FORM FUNCTIONALITY/SUBMIT
import { useForm } from "react-hook-form";

import { updateUser } from "@/lib/actions/user.actions";
import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

interface Props {
	user: {
		id: string;
		objectId: string;
		username: string;
		name: string;
		bio: string;
		image: string;
	};
	btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
	//HANDLING THE PROFILE IMAGE UPLOAD FILE
	const [files, setFiles] = useState<File[]>([]);

	//UPLOADTHING FUNCTION
	const { startUpload } = useUploadThing("media");

	const router = useRouter();
	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(UserValidation),
		defaultValues: {
			profile_photo: user?.image || "",
			name: user?.name || "",
			username: user?.username || "",
			bio: user?.bio || "",
		},
	});

	//HANDLES IMAGE UPLAOD AND CHANGE
	const handleImage = (
		e: ChangeEvent<HTMLInputElement>,
		//field.onChange FROM REACT HOOK FORM
		fieldChange: (value: string) => void
	) => {
		e.preventDefault();

		// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
		// https://www.youtube.com/watch?v=u2VTtAXq1iA&ab_channel=OpenJavaScript
		const filereader = new FileReader();

		//event.target.files ACCESSES THE UPLOADED FILE
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];

			setFiles(Array.from(e.target.files));

			//IF FILE ISNT IMAGE EXIT FUNCTION
			if (!file.type.includes("image")) return;

			//TAKES TIME FOR FILE TO UPLOAD SO WAIT FOR THE ONLOAD EVENT LISTENER
			filereader.onload = async (event) => {
				//RESULT PROPERTY ON THE FILEREADER IS THE URL TO THE IMAGE
				const imageDataUrl = event.target?.result?.toString() || "";
				//SETTING THE INPUT FIELD TO THE IMAGE URL FROM RESULT
				//CAN BE DONE OUTSIDE THE FUNCTION DOESNT REALLY MATTER
				//ONLY UPDATES THE INPUT FIELD TEXT
				fieldChange(imageDataUrl);
			};

			//ONLY STARTS ONCE THE FILE IS FINISHED UPLOADING
			//READING THE FILE AS URL TO SET SRC FOR IMAGE
			filereader.readAsDataURL(file);
		}
	};

	const onSubmit = async (values: z.infer<typeof UserValidation>) => {
		//VALUE FROM INPUT FIELD;
		const blob = values.profile_photo;

		//IF USER UPLOADED THEIR OWN PHOTO NOT FROM GOOGLE/GITHUB
		const hasImageChanged = isBase64Image(blob);

		//UPLOADING THE NEW IMAGE TO UPLOADTHING TO HOST
		//THEN GRABBING FILEURL TO SAVE INTO OUR MONGODB
		if (hasImageChanged) {
			const imgRes = await startUpload(files);
			if (imgRes && imgRes[0].fileUrl) {
				//USING REACT HOOK FORM SETTING VALUE OF IMAGE AFTER UPLOAD
				values.profile_photo = imgRes[0].fileUrl;
			}
		}
		//COMING FROM USER ACTIONS
		await updateUser({
			username: values.username,
			name: values.name,
			bio: values.bio,
			image: values.profile_photo,
			//USER.ID COMING FROM CLERK
			userId: user.id,
			path: pathname,
		});

		if (pathname === "/profile/edit") {
			router.back();
		} else {
			//IF COMING FROM ONBOARDING THEN CONTINUE TO HOME
			router.push("/");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col justify-start gap-10'
			>
				<FormField
					control={form.control}
					name='profile_photo'
					render={({ field }) => (
						<FormItem className='flex items-center gap-4'>
							<FormLabel className='account-form_image-label'>
								{field.value ? (
									<Image
										src={field.value}
										alt='profile_icon'
										width={96}
										height={96}
										priority
										className='rounded-full object-contain'
									/>
								) : (
									<Image
										src='/assets/profile.svg'
										alt='profile_icon'
										width={24}
										height={24}
										className='object-contain'
									/>
								)}
							</FormLabel>
							<FormControl className='flex-1 text-base-semibold text-gray-200'>
								<Input
									type='file'
									accept='image/*'
									placeholder='Upload a photo'
									className='account-form_image-input'
									onChange={(e) => handleImage(e, field.onChange)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem className='flex  gap-3 w-full flex-col'>
							<FormLabel className='text-base-semibold text-light-2'>
								Name
							</FormLabel>
							<FormControl>
								<Input
									type='text'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='username'
					render={({ field }) => (
						<FormItem className='flex  gap-3 w-full flex-col'>
							<FormLabel className='text-base-semibold text-light-2'>
								Username
							</FormLabel>
							<FormControl>
								<Input
									type='text'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='bio'
					render={({ field }) => (
						<FormItem className='flex  gap-3 w-full flex-col'>
							<FormLabel className='text-base-semibold text-light-2'>
								Bio
							</FormLabel>
							<FormControl>
								<Textarea
									rows={10}
									type='text'
									className='account-form_input no-focus'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit' className='bg-primary-500'>
					Submit
				</Button>
			</form>
		</Form>
	);
};

export default AccountProfile;
