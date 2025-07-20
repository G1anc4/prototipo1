import { neon } from '@netlify/neon';

const sql = neon(); // Usa automáticamente NETLIFY_DATABASE_URL

export async function handler(event, context) {
  const postId = event.queryStringParameters.id;

  try {
    const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    return {
      statusCode: 200,
      body: JSON.stringify(post),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
