export async function onRequestGet(context) {
  const { env } = context;
  const body = {
    SUPABASE_URL: env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || ''
  };
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
  });
}
