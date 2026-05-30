const fs = require('fs');
let c = fs.readFileSync('backend/routes/api.php', 'utf8');
if (!c.includes('/test-ref')) {
  c += "\nRoute::get('/test-ref', function() { return \\App\\Services\\ReferenceGeneratorService::generate(); });\n";
  fs.writeFileSync('backend/routes/api.php', c);
}
