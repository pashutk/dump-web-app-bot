fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`, {
	method: 'POST',
	data: `url=${process.env.WEBHOOK_URL}`
})
	.then((a) => a.json())
	.then((a) => console.log(a))
	.catch((err) => console.error(err));
