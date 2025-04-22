export async function GET(request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'World';

  return new Response(JSON.stringify({ message: `Hello ${name}!` }), {
    headers: { "Content-Type": "application/json" },
  });
}