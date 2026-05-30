const fs = require('fs');

async function test() {
  const loginRes = await fetch('http://127.0.0.1:8000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ identifier: '+243912345678', password: 'password' })
  });
  
  if (!loginRes.ok) {
    console.log("Login failed", loginRes.status, await loginRes.text());
    return;
  }
  
  // Wait, logging in usually sends an OTP in this system. Let's just create a test token using artisan.
}
test();
