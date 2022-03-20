const { createServer } = require('http');
const { createReadStream, statSync } = require('fs');
const { parse } = require('url');

const PORT = process.env.PORT || 3000;
const app = createServer((req, res) => {
	const path = parse(req.url).pathname;
	if (path == '/' || path == '/index.html') {
		const index = createReadStream('./index.html');
		index.pipe(res);
	} else if (path == '/video') {
		const range = req.headers.range;

		if (!range) {
			res.statusCode = 400;
			res.end('Requires Range');
		}

		const { size } = statSync('./video.mp4');
		const chunk = 10 ** 6;
		const start = Number(range.replace(/\D/g, ''));
		const end = Math.min(start + chunk, size - 1);

		const contentLength = end - start + 1;
		const headers = {
			'Content-Range': `Bytes ${start}-${end}/${size}`,
			'Accept-Range': 'Bytes',
			'Content-Type': 'video/mp4',
			'Content-Length': contentLength
		};

		res.writeHead(206, headers);
		console.log(`This is the Range: ${range}`);
		console.log(`This is the end: ${end}`);
		const video = createReadStream('./video.mp4', { start, end });
		video.pipe(res);
	} else {
		const notFound = createReadStream('./notFound.html');
		notFound.pipe(res);
	}
});

app.listen(PORT, () => console.log(`Speak to me on port: ${PORT}`));
