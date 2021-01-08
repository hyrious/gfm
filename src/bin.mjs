#!/usr/bin/env node
import { render } from "./index.mjs";
import { readFileSync, watchFile } from "fs";

// https://github.com/jdxcode/password-prompt/blob/master/index.js
// TODO: RawMode is a bad idea. Better use readline with muted stream.
/** @returns {Promise<string>} */
function askForToken() {
    const { stdin, stderr } = process;
    return new Promise((resolve) => {
        let input = "";
        stderr.write("Input token (invisible): ");
        stdin.resume();
        stdin.setRawMode(true);
        /** @param {Buffer} c */
        function fn(c) {
            switch (c.toString()) {
                case "\u0004":
                case "\r":
                case "\n":
                    stderr.write("\n");
                    stdin.removeListener("data", fn);
                    stdin.setRawMode(false);
                    stdin.pause();
                    return resolve(input.replace(/\r$/, ""));
                case "\u0003":
                    stderr.write("^C\n");
                    stdin.removeListener("data", fn);
                    stdin.setRawMode(false);
                    stdin.pause();
                    return process.exit();
                default:
                    if (c.readInt8() === 127) {
                        input = input.substring(0, input.length - 1);
                    } else {
                        input += c.toString();
                    }
            }
        }
        stdin.on("data", fn);
    });
}

// https://stackoverflow.com/questions/30441025/read-all-text-from-stdin-to-a-string
async function readAllStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString();
}

/** @param {string} file - markdown file path */
async function listenAndServe(file, options) {
    const { createServer } = await import("http");
    const port = +process.env.PORT || 3000;
    const clients = new Set();

    let remembered;
    watchFile(file, async () => {
        const now = readFileSync(file, "utf-8");
        if (remembered !== now) {
            remembered = now;
            const html = await render(now, options);
            for (const { res } of clients) {
                res.write("data: " + JSON.stringify(html) + "\n\n");
            }
        }
    });

    return createServer(async (req, res) => {
        const url = new URL(req.url, "http://localhost/");
        const pathname = url.pathname;

        if (req.method === "GET") {
            if (pathname === "/") {
                res.setHeader("Content-Type", "text/html");
                res.write(`<!DOCTYPE html><html><head>
<script type="module" src="/__client"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css">
<style>
    .markdown-body {
        box-sizing: border-box;
        min-width: 200px;
        max-width: 980px;
        margin: 0 auto;
        padding: 45px;
    }

    @media (max-width: 767px) {
        .markdown-body {
            padding: 15px;
        }
    }
</style>
<title></title></head><body class="markdown-body"><p>loading...</p>`);
                res.end();
            } else if (pathname === "/__client") {
                res.setHeader("Content-Type", "text/javascript");
                res.write(`const source = new EventSource('/__server');
source.onmessage = ({ data }) => {
    console.log('[gfm] refresh');
    document.body.innerHTML = JSON.parse(data);
}`);
                res.end();
            } else if (pathname === "/__server") {
                const client = { res };
                clients.add(client);
                req.connection.addListener("close", () =>
                    clients.delete(client)
                );
                res.writeHead(200, {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                });
                res.write(": this is a comment\n\n");
                const html = await render(readFileSync(file, "utf-8"), options);
                res.write("data: " + JSON.stringify(html) + "\n\n");
            } else {
                res.writeHead(404);
                res.write("not found");
                res.end();
            }
        } else {
            res.writeHead(404);
            res.write("not found");
            res.end();
        }
    }).listen(port, () => {
        console.log("server is listening to http://localhost:" + port);
    });
}

async function main() {
    const args = process.argv.slice(2);
    let serve = false;
    let requireToken = false;
    let file = null;
    for (const arg of args) {
        if (arg === "--serve") serve = true;
        if (arg === "--token") requireToken = true;
        if (file === null && !arg.startsWith("-")) file = arg;
    }
    let token = null;
    if (requireToken) {
        token = await askForToken();
    }
    let rateLimit = {};
    if (serve) {
        if (!file) {
            console.error("provide a file.md to serve");
        } else {
            await listenAndServe(file, { token, rateLimit });
        }
    } else {
        /** @type {string} */
        let text;
        if (file) {
            text = readFileSync(file, "utf-8");
        } else {
            text = await readAllStdin();
        }
        console.log(await render(text, { token, rateLimit }));
    }
}

main().catch(console.error);
