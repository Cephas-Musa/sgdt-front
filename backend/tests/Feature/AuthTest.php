<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PhoneOtp;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Carbon\Carbon;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test que le login envoie toujours un OTP (y compris pour le superadmin).
     */
    public function test_superadmin_login_requires_otp(): void
    {
        // Créer l'utilisateur Superadmin (déjà vérifié)
        User::create([
            'phone_number' => '+243995833424',
            'password' => Hash::make('Dragon@2004'),
            'role' => 'super_admin',
            'full_name' => 'Superadmin',
            'phone_verified_at' => Carbon::now(),
        ]);

        $response = $this->postJson('/api/login', [
            'phone_number' => '+243995833424',
            'password' => 'Dragon@2004',
        ]);

        // Tout utilisateur (même le superadmin) reçoit maintenant un OTP à chaque connexion
        // Le code OTP N'EST PAS retourné dans la réponse — il est envoyé uniquement par SMS
        $response->assertStatus(200)
            ->assertJson([
                'status' => 'otp_required',
                'phone_number' => '+243995833424',
            ])
            ->assertJsonMissing(['otp_code']); // Le code ne doit JAMAIS apparaître dans la réponse
    }

    /**
     * Test que les numéros avec des préfixes invalides (autres que +256 et +243) sont rejetés.
     */
    public function test_invalid_phone_prefixes_are_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'phone_number' => '+33794248588', // France (+33)
            'password' => 'Dragon@2004',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone_number']);
    }

    /**
     * Test que les numéros sans préfixe international (+) sont rejetés.
     */
    public function test_phone_without_plus_prefix_is_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'phone_number' => '256794248588',
            'password' => 'Dragon@2004',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone_number']);
    }

    /**
     * Test que la première connexion d'un utilisateur non vérifié exige l'OTP
     * et envoie le code OTP par SMS (sans le retourner dans la réponse).
     */
    public function test_unverified_user_requires_otp_on_login(): void
    {
        User::create([
            'phone_number'      => '+243810000000',
            'password'          => Hash::make('Password123!'),
            'role'              => 'inspecteur',
            'full_name'         => 'Inspecteur Test',
            'phone_verified_at' => null, // Non vérifié
        ]);

        $response = $this->postJson('/api/login', [
            'phone_number' => '+243810000000',
            'password'     => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status'       => 'otp_required',
                'phone_number' => '+243810000000',
            ])
            ->assertJsonMissing(['otp_code']); // Le code ne doit JAMAIS apparaître dans la réponse

        // Vérifier que le code OTP a bien été inséré en base de données
        $this->assertDatabaseHas('phone_otps', [
            'phone_number' => '+243810000000',
            'used_at'      => null,
        ]);
    }

    /**
     * Test que la validation d'un OTP valide authentifie l'utilisateur.
     */
    public function test_otp_verification_authenticates_user(): void
    {
        $user = User::create([
            'phone_number' => '+243810000000',
            'password' => Hash::make('Password123!'),
            'role' => 'inspecteur',
            'full_name' => 'Inspecteur Test',
            'phone_verified_at' => null,
        ]);

        // Créer un OTP
        $otp = PhoneOtp::create([
            'phone_number' => '+243810000000',
            'code' => '123456',
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/verify-otp', [
            'phone_number' => '+243810000000',
            'code' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'access_token',
                'user' => [
                    'phone_number',
                    'role',
                ]
            ]);

        // Vérifier que l'utilisateur est maintenant marqué comme vérifié en BD
        $this->assertNotNull($user->fresh()->phone_verified_at);
        // Vérifier que le code OTP est marqué comme utilisé
        $this->assertNotNull($otp->fresh()->used_at);
    }

    /**
     * Test que le Superadmin peut créer un nouvel utilisateur
     * et récupérer ses identifiants en clair pour les copier.
     */
    public function test_superadmin_can_create_user_with_copyable_credentials(): void
    {
        $superadmin = User::create([
            'phone_number' => '+243995833424',
            'password' => Hash::make('Dragon@2004'),
            'role' => 'super_admin',
            'full_name' => 'Super Admin',
            'phone_verified_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($superadmin)
            ->postJson('/api/users', [
                'phone_number' => '+243999111222',
                'role' => 'inspecteur',
                'full_name' => 'Inspecteur Jean',
                'bureau' => 'GOMA',
                'province' => 'NORD-KIVU',
                'matricule' => 'INS-999',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user',
                'credentials' => [
                    'phone_number',
                    'password',
                ]
            ])
            ->assertJson([
                'message' => 'Utilisateur créé avec succès.',
                'credentials' => [
                    'phone_number' => '+243999111222',
                ]
            ]);

        // Vérifier que le mot de passe renvoyé commence bien par SGDT@ (généré aléatoirement)
        $this->assertStringStartsWith('SGDT@', $response['credentials']['password']);

        // Vérifier que le nouvel utilisateur a été créé sans phone_verified_at (pour forcer l'OTP)
        $newUser = User::where('phone_number', '+243999111222')->first();
        $this->assertNotNull($newUser);
        $this->assertNull($newUser->phone_verified_at);
    }

    /**
     * Test que les non-superadmins ne peuvent pas créer d'utilisateurs.
     */
    public function test_non_superadmin_cannot_create_user(): void
    {
        $inspecteur = User::create([
            'phone_number' => '+243810000000',
            'password' => Hash::make('Password123!'),
            'role' => 'inspecteur',
            'full_name' => 'Inspecteur Test',
            'phone_verified_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($inspecteur)
            ->postJson('/api/users', [
                'phone_number' => '+243999111222',
                'role' => 'inspecteur',
                'full_name' => 'Inspecteur Jean',
            ]);

        $response->assertStatus(403);
    }
}
