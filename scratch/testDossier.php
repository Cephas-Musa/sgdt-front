<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(7);
echo "User role: " . $user->role . "\n";
$service = app(App\Services\DossierAccessService::class);
$dossiers = $service->getActiveDossiers($user);
echo "Count: " . count($dossiers) . "\n";
echo "IDs: " . json_encode($dossiers->pluck('id')) . "\n";
