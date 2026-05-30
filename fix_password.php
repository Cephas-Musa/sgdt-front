<?php
// Check super admin and reset password
chdir(__DIR__ . '/backend');
require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('phone_number', '+243813478556')->first();
if (!$user) {
    echo "User NOT FOUND\n";
    exit;
}

echo "Found: " . $user->full_name . " role=" . $user->role . "\n";
echo "Password 'password' matches: " . (Hash::check('password', $user->password) ? 'YES' : 'NO') . "\n";

// Reset password to 'password'
$user->password = Hash::make('password');
$user->save();
echo "Password reset to 'password'\n";
echo "Verify: " . (Hash::check('password', $user->fresh()->password) ? 'YES' : 'NO') . "\n";
