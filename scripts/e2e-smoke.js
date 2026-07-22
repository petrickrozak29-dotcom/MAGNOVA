const fetch =
  globalThis.fetch ?? ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

async function findFrontendBase() {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '');
  if (process.env.FRONTEND_PORT) return `http://localhost:${process.env.FRONTEND_PORT}`;
  const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
  for (const p of ports) {
    try {
      const res = await fetch(`http://localhost:${p}/`, { method: 'GET' });
      if (res && res.status) {
        return `http://localhost:${p}`;
      }
    } catch (_) {
      // try next
    }
  }
  return 'http://localhost:3000';
}

(async () => {
  try {
    const frontendBase = await findFrontendBase();
    console.log('Using frontend base URL:', frontendBase);

    console.log('Create submission');
    const post = await fetch('http://localhost:4000/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E CI Smoke',
        location: 'Alun-Alun',
        description: 'CI smoke',
        featureType: 'KULINER',
        categoryName: 'UMKM',
      }),
    });
    const created = await post.json();
    console.log('created', post.status, created.id);

    console.log('Login dev');
    const login = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'developermagelang45@gmail.com',
        password: 'potensimagelang45#',
      }),
    });
    const lb = await login.json();
    const token = lb.token;

    const patch = await fetch(`http://localhost:4000/api/submissions/${created.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    const pbody = await patch.json();
    console.log('patched', patch.status, pbody.status);

    const cul = await fetch('http://localhost:4000/api/culinary');
    const culj = await cul.json();
    console.log(
      'culinary count after',
      Array.isArray(culj) ? culj.length : culj.items ? culj.items.length : 0
    );

    console.log('fetch frontend page');
    const page = await fetch(`${frontendBase}/kuliner`);
    console.log('/kuliner', page.status, `(from ${frontendBase})`);
    const html = await page.text();
    console.log(html.includes(created.id) ? 'page contains id' : 'page missing id');

    process.exit(0);
  } catch (err) {
    console.error('E2E error', err.message);
    process.exit(2);
  }
})();
