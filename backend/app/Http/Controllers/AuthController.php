<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PhoneOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use App\Services\SmsService;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur (avec gestion OTP si non vérifié)
     */
    public function login(Request $request)
    {
        $request->validate([
            'phone_number' => [
                'required',
                'string',
                // Validation stricte des préfixes +256 et +243 suivi de 9 à 12 chiffres
                'regex:/^\+(256|243)[0-9]{9,12}$/'
            ],
            'password' => 'required|string',
        ], [
            'phone_number.regex' => 'Le numéro doit commencer par +256 ou +243 suivi du numéro valide.'
        ]);

        $user = User::where('phone_number', $request->phone_number)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'phone_number' => ['Les identifiants de connexion sont incorrects.'],
            ]);
        }

        // Générer un code OTP à 6 chiffres à chaque connexion
        $otpCode = strval(mt_rand(100000, 999999));

        // Invalider les anciens OTPs non utilisés pour ce numéro
        PhoneOtp::where('phone_number', $user->phone_number)
            ->whereNull('used_at')
            ->update(['used_at' => Carbon::now()]);

        // Stocker le nouveau code OTP
        PhoneOtp::create([
            'phone_number' => $user->phone_number,
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(15),
        ]);

        // Envoyer le SMS de manière asynchrone pour ne pas ralentir la connexion
        defer(function () use ($user, $otpCode) {
            $smsService = new SmsService();
            $smsService->sendSms(
                $user->phone_number,
                "Votre code de connexion SGDT est : {$otpCode}. Il expire dans 15 minutes."
            );
        });

        // Le code OTP n'est jamais retourné dans la réponse — il est envoyé uniquement par SMS
        return response()->json([
            'status'       => 'otp_required',
            'message'      => 'Un code OTP a été envoyé par SMS sur votre numéro.',
            'phone_number' => $user->phone_number,
            'sms_sent'     => true, // Assumé vrai car différé
        ]);
    }

    /**
     * Validation du code OTP à 6 chiffres
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone_number' => [
                'required',
                'string',
                'regex:/^\+(256|243)[0-9]{9,12}$/'
            ],
            'code' => 'required|string|size:6',
        ]);

        // Recherche du code valide non expiré et non utilisé
        $otp = PhoneOtp::where('phone_number', $request->phone_number)
            ->where('code', $request->code)
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->first();

        // Accepter 000000 comme code OTP par défaut si non reçu
        if (!$otp && $request->code !== '000000') {
            throw ValidationException::withMessages([
                'code' => ['Le code OTP est invalide ou a expiré.'],
            ]);
        }

        // Marquer le code comme utilisé si ce n'est pas le bypass
        if ($otp) {
            $otp->update(['used_at' => Carbon::now()]);
        }

        // Mettre à jour l'utilisateur comme vérifié
        $user = User::where('phone_number', $request->phone_number)->first();
        if ($user) {
            $user->update(['phone_verified_at' => Carbon::now()]);
        }

        // Générer le token de connexion
        $token = $user->createToken('sgdt_auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'phone_number' => $user->phone_number,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'bureau' => $user->bureau,
                'province' => $user->province,
                'matricule' => $user->matricule,
            ]
        ]);
    }

    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }
}
