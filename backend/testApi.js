const https = require('http');
const req = https.request({
  hostname: 'localhost',
  port: 8000,
  path: '/api/dossiers/019e6ee2-5764-7148-95eb-988412aedc92/details',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer 1|T6cOqf2lV10oE2Zl6Z10aLd88m81L23g9Zg2'
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(res.statusCode, body));
});
req.on('error', e => console.error(e));
req.end();
