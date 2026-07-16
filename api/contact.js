// Contact form handler — relays enquiries to info@underbridges.co.za via Resend.
// The Resend key lives in the RESEND_API_KEY environment variable (Vercel project
// settings), never in this repo.

const LIMITS = { name: 200, email: 320, company: 300, help: 100, message: 5000 };

// Collapse control characters so user input can't smuggle extra mail headers.
const clean = (v) => String(v || '').replace(/[\r\n\t]+/g, ' ').trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot filled in — pretend success so bots learn nothing.
  if (body._honey) return res.status(200).json({ ok: true });

  const name = clean(body.name);
  const email = clean(body.email);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'A valid email is required' });
  for (const [field, max] of Object.entries(LIMITS)) {
    if (body[field] && String(body[field]).length > max) {
      return res.status(400).json({ error: 'Input too long' });
    }
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${clean(body.company) || '—'}`,
    `Needs help with: ${clean(body.help) || '—'}`,
    '',
    String(body.message || '').trim() || '(no message)'
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Under Bridges Website <website@underbridges.co.za>',
        to: ['info@underbridges.co.za'],
        reply_to: email,
        subject: `New enquiry — ${name}`,
        text
      })
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend send failed:', r.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'Email service failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Resend request error:', e && e.message);
    return res.status(502).json({ error: 'Email service failed' });
  }
}
