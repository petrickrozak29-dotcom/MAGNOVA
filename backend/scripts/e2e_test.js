const base = 'http://localhost:4000';

async function main() {
  try {
    console.log('Creating submission...');
    const createResp = await fetch(`${base}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Test Event',
        date: '2026-06-11T10:00:00.000Z',
        location: 'Magelang Center',
        description: 'Event created by automated e2e test',
        image: 'https://example.com/test.jpg',
      }),
    });
    const created = await createResp.json();
    console.log('Created:', created);

    console.log('Logging in developer...');
    const loginResp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'developermagelang45@gmail.com',
        password: 'potensimagelang45#',
      }),
    });
    const loginJson = await loginResp.json();
    console.log('Login result:', loginJson);
    const token = loginJson.token;

    if (!token) {
      console.error('No token from login, aborting');
      process.exit(1);
    }

    console.log('Approving submission as developer...');
    const approveResp = await fetch(`${base}/api/developer/events/${created.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    const approveJson = await approveResp.json();
    console.log('Approve result:', approveJson);

    console.log('Fetching public events...');
    const listResp = await fetch(`${base}/api/events`);
    const listJson = await listResp.json();
    console.log('Public events count:', Array.isArray(listJson) ? listJson.length : 0);

    console.log('Fetching notifications for developer...');
    const notiResp = await fetch(`${base}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notiJson = await notiResp.json();
    console.log('Notifications:', notiJson);

    console.log('E2E test completed');
  } catch (err) {
    console.error('E2E test failed', err);
    process.exit(1);
  }
}

main();
