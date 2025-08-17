import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

async function fetchWithTimeout(url: string, ms = 3000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);

    try {
        const response = await fetch(url, { signal: controller.signal, redirect: "follow" });
        return response.url;
    } catch (err: any) {
        if (err.name === "AbortError") {
            return "";
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

app.post("/get_final_urls", async (c) => {
    const urls: string[] = await c.req.json();
    const results = (await Promise.all(urls.map(u => fetchWithTimeout(u, 3000)))).map(url=>url != "");
    return c.json(results);
});

export default app;
