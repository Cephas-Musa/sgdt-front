<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$u = App\Models\User::where('phone_number', '+243813478556')->first();
if ($u) {
    $u->phone_number = '+243813478556';
    $u->save();
    echo "OK\n";
} else {
    echo "Not found\n";
}
