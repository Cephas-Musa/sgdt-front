<?php
// Test script - run with: php backend/test_api.php

require_once __DIR__ . '/backend/vendor/autoload.php';

$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

// Get inspecteur_chef user and create token
$user = App\Models\User::where('role', 'inspecteur_chef')->first();
if (!$user) {
    echo "No inspecteur_chef user found. Available roles:\n";
    App\Models\User::all()->pluck('role', 'id')->each(fn($r, $id) => print("$id: $r\n"));
    exit;
}

echo "User: " . $user->full_name . " (role: " . $user->role . ")\n";

// Create a sanctum token
$token = $user->createToken('test-token')->plainTextToken;
echo "Token: $token\n";

// Now test the /api/dossiers endpoint
$ch = curl_init('http://127.0.0.1:8000/api/dossiers');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
$data = json_decode($response, true);
if ($httpCode === 200) {
    echo "SUCCESS! Dossiers count: " . count($data) . "\n";
} else {
    echo "ERROR: " . ($data['message'] ?? $response) . "\n";
}
