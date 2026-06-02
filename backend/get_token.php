<?php
$token = \App\Models\User::find(1)->createToken('Test')->plainTextToken;
echo $token;
