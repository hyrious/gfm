/**
 * `POST` github's markdown api
 * @param text - markdown text
 * @param options - to increase and get rateLimit
 * @example
 * let rateLimit = {}
 * let html = await render('# hello', { token: '123456', rateLimit })
 * console.log(html, rateLimit)
 */
export function render(
    text: string,
    options?: {
        token?: string;
        // prettier-ignore
        rateLimit?: {
            limit: string;
            remaining: string;
            reset: string;
        } | object;
    }
): Promise<string>;
