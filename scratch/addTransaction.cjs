const fs = require('fs');
let c = fs.readFileSync('backend/app/Http/Controllers/DossierController.php', 'utf8');

const regex = /\/\/ Déduction du solde de l'inspecteur\s*\$user->wallet_balance = floatval\(\$user->wallet_balance\) - \$tarif;\s*\$user->save\(\);/;
const replacement = `// Déduction du solde de l'inspecteur et historisation du paiement
            $user->wallet_balance = floatval($user->wallet_balance) - $tarif;
            $user->save();

            // Création de la transaction pour traçabilité du paiement
            if ($tarif > 0) {
                \\App\\Models\\Transaction::create([
                    'user_id' => $user->id,
                    'reference' => 'PAY-' . $dossier->reference . '-' . time(),
                    'type' => 'debit',
                    'amount' => $tarif,
                    'currency' => $typeDossier->devise ?? 'USD',
                    'status' => 'completed',
                    'description' => 'Paiement pour la création du dossier ' . $dossier->reference,
                ]);
            }`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('backend/app/Http/Controllers/DossierController.php', c);
  console.log("Success");
} else {
  console.log("Regex did not match");
}
