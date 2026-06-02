<?php
$user = \App\Models\User::find(1); // Inspecteur
echo "User Role: " . $user->role . "\n";
echo "User Bureau ID: " . $user->bureau_id . "\n";

$service = new \App\Services\DossierAccessService();
$dossiers = $service->getActiveDossiers($user);
echo "Total visible dossiers: " . $dossiers->count() . "\n";

foreach($dossiers as $d) {
    echo "ID: " . $d->id . " | Creator Role: " . ($d->creator->role ?? 'N/A') . " | Reference: " . $d->reference . " | Bureau ID: " . $d->bureau_id . "\n";
}
