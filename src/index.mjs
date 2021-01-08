import { request } from "https";

/**
 * `POST` github's markdown api
 * @param {string} text - markdown text
 * @param {{ token?: string, rateLimit?: object }} options - to increase and get rateLimit
 * @returns {Promise<string>}
 * @example
 * let rateLimit = {}
 * let html = await render('# hello', { token: '123456', rateLimit })
 * console.log(html, rateLimit)
 */
export function render(text, options = null) {
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Node.js",
    };
    if (options?.token) {
        headers.Authorization = `token ${options.token}`;
    }
    return new Promise((resovle, reject) => {
        const req = request(
            {
                hostname: "api.github.com",
                path: "/markdown",
                method: "POST",
                headers,
            },
            (res) => {
                if (options?.rateLimit) {
                    Object.assign(options.rateLimit, {
                        limit: res.headers["X-RateLimit-Limit"],
                        remaining: res.headers["X-RateLimit-Remaining"],
                        reset: res.headers["X-RateLimit-Reset"],
                    });
                }
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    resovle(chunks.join());
                });
            }
        );
        req.on("error", reject);
        req.write(JSON.stringify({ text }));
        req.end();
    });
}
