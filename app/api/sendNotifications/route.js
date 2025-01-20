import { messaging } from '../../../utils/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tokens, notification } = body;
    // TODO: Add country and city to the notification payload
    if (!tokens || !notification) {
      return new Response(
        JSON.stringify({ error: 'Missing tokens or notification payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
    };
    var message = {
      data: {
        score: '850',
        time: '2:45',
      },
      token: tokens[0],
    };
    console.log(message, tokens);
    const response = await messaging.send(message);

    return new Response(JSON.stringify({ success: true, response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
