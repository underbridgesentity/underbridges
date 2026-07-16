// TEMPORARY diagnostic — lists the Resend domains visible to the live key
// (names + verification status only, no secrets). Delete after use.

export default async function handler(req, res) {
  if ((req.query && req.query.t) !== 'ub-diag-x84kq2') return res.status(404).json({ error: 'Not found' });
  try {
    const r = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    });
    const j = await r.json();
    return res.status(200).json({
      apiStatus: r.status,
      domains: (j.data || []).map(d => ({ name: d.name, status: d.status }))
    });
  } catch (e) {
    return res.status(502).json({ error: e && e.message });
  }
}
