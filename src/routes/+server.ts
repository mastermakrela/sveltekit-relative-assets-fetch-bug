import type { RequestHandler } from "@sveltejs/kit";

import asset from "$lib/image.png";
import { read } from "$app/server";

export const GET: RequestHandler = async ({ fetch: sk_fetch, url, platform }) => {
	console.log("🚀 ~ asset path:", asset);

	const abs_asset = new URL(url);
	abs_asset.pathname = asset;
	console.log("🚀 ~ absolute asset path:", abs_asset);

	console.log("🚀 ~ global fetch + abs", "start");
	const asset1 = await fetch(abs_asset);
	console.log("🚀 ~ global fetch + abs:", asset1);

	console.log("🚀 ~ sveltekit fetch + rel", "start");
	const asset2 = await sk_fetch(asset);
	console.log("🚀 ~ sveltekit fetch + rel:", asset2);

	console.log("🚀 ~ sveltekit fetch + abs", "start");
	const asset3 = await sk_fetch(abs_asset);
	console.log("🚀 ~ sveltekit fetch + abs:", asset3);

	console.log("🚀 ~ read + rel", "start");
	// to compile for cloudflare we have to comment out read
	const asset4 = read(asset);
	// const asset4 = undefined;
	console.log("🚀 ~ read + rel:", asset4);

	console.log("🚀 ~ other +server endpoint", "start");
	const data1 = await sk_fetch("/other");
	console.log("🚀 ~ other +server endpoint:", data1);

	return new Response(`
fetch       url
----------+-----
global    + rel: error per definition
global    + abs: ${asset1.ok}
sveltekit + rel: ${asset2.ok}
sveltekit + abs: ${asset3.ok}
read      + rel: ${asset4?.ok}
read      + abs: doesn't make sense
----------------
other     +server: ${data1.ok}
`);
};
