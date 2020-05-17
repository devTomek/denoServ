import {
	Application,
	isHttpError,
	Status,
} from "https://deno.land/x/oak/mod.ts";

const app = new Application();

// Logger
app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.headers.get("X-Response-Time");
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Error handling
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		if (isHttpError(error)) {
			switch (error.status) {
				case Status.NotFound as number:
					ctx.response.body = {
						status: Status.NotFound,
						message: "Not Found",
					};
					console.log(error);
				default:
					ctx.response.body = {
						status: error.status,
						message: "Unhandled error status",
					};
					console.log(error);
			}
		} else {
			throw new Error(error);
		}
	}
});

// Hello World!
app.use((ctx) => {
	ctx.response.body = "Hello World!";
});

app.use();

await app.listen({ port: 8000 });
