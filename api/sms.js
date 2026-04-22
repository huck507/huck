export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, body } = req.body;
  if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message });
    res.status(200).json({ success: true, sid: data.sid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
