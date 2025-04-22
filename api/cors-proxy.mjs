export async function GET(request) {
  const targetUrl = new URL(request.url).searchParams.get("url");
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const fetchResponse = await fetch(targetUrl, {
      headers: {
        "Accept-Encoding": request.headers.get("Accept-Encoding") || "gzip, deflate, br",
      },
    });

    const headers = new Headers(fetchResponse.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.delete("Content-Encoding"); // Remove Content-Encoding to avoid decoding issues

    return new Response(fetchResponse.body, {
      status: fetchResponse.status,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch the URL." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
