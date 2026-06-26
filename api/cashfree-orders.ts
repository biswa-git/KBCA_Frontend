const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg/orders';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID ?? process.env.VITE_CASHFREE_APP_ID;
const CASHFREE_SECRET = process.env.CASHFREE_SECRET ?? process.env.VITE_CASHFREE_SECRET;
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION ?? '2025-01-01';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!CASHFREE_APP_ID || !CASHFREE_SECRET) {
    return res.status(500).json({ error: 'Cashfree credentials are not configured.' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  try {
    const cfRes = await fetch(CASHFREE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET,
        'x-api-version': CASHFREE_API_VERSION,
      },
      body: JSON.stringify(payload),
    });

    const text = await cfRes.text();
    if (text.trim() === '') {
      return res.status(cfRes.status).json({});
    }

    try {
      const data = JSON.parse(text);
      if (data && typeof data === 'object' && !('message' in data) && 'error' in data) {
        (data as any).message = (data as any).error;
      }
      res.status(cfRes.status).json(data);
    } catch {
      res.status(cfRes.status).send(text);
    }
  } catch (error: any) {
    res.status(500).json({ error: String(error) });
  }
}
