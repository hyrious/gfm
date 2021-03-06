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
export async function render(text, options = null) {
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
    };
    if (options?.token) {
        headers.Authorization = `token ${options.token}`;
    }
    const res = await fetch("https://api.github.com/markdown", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers,
    });
    if (options?.rateLimit) {
        Object.assign(options.rateLimit, {
            limit: res.headers.get("X-RateLimit-Limit"),
            remaining: res.headers.get("X-RateLimit-Remaining"),
            reset: res.headers.get("X-RateLimit-Reset"),
        });
    }
    return await res.text();
}
