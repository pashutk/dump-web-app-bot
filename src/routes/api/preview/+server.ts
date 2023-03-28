import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ fetch, request }) => {
	const { url } = await request.json();
	const x = await fetch(url).then((a) => a.text());
	const rows = x.split('\n');
	const titleStart = '<meta property="twitter:title" content="';
	const titlePlaceholderStart = 'Telegram: Contact @';
	let title = rows.find((r) => r.startsWith(titleStart))?.slice(titleStart.length, -2);
	if (title?.startsWith(titlePlaceholderStart)) {
		title = title.slice(titlePlaceholderStart.length);
	}

	const imageStart = '<meta property="twitter:image" content="';
	let image = rows.find((r) => r.startsWith(imageStart))?.slice(imageStart.length, -2);

	return json({ title, image });
};
