fetch('http://127.0.0.1:8000/api/config/countries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    // I am deliberately omitting Authorization token to see if it gives 401 or 500
  },
  body: JSON.stringify({id: 'TEST', code: 'TT', designation: 'Test Country'})
}).then(r => r.json().then(j => console.log(r.status, j))).catch(console.error);
