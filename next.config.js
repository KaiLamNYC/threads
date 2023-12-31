/** @type {import('next').NextConfig} */
const nextConfig = {
	//DEPLOYMENT STUFF
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		serverActions: true,
		serverComponentsExternalPackages: ["mongoose"],
		//HAD TO INCREASE REQ BODY LIMIT
		serverActionsBodySizeLimit: "10mb",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.clerk.com",
			},
			{
				protocol: "https",
				hostname: "images.clerk.dev",
			},
			{
				protocol: "https",
				hostname: "uploadthing.com",
			},
			{
				protocol: "https",
				hostname: "placehold.co",
			},
		],
		typescript: {
			ignoreBuildErrors: true,
		},
	},
};

module.exports = nextConfig;
