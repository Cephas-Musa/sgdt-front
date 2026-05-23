<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Envoyer un message SMS via BulkSMS
     *
     * @param string $to     Numéro de téléphone au format international (ex: +243...)
     * @param string $message Corps du message
     * @return bool
     */
    public function sendSms(string $to, string $message): bool
    {
        $url         = config('services.bulksms.url', 'https://api.bulksms.com/v1/messages');
        $tokenId     = config('services.bulksms.token_id');
        $tokenSecret = config('services.bulksms.token_secret');
        $senderId    = config('services.bulksms.sender_id', 'SGDT');

        if (!$tokenId || !$tokenSecret) {
            Log::warning("[SmsService] Identifiants BulkSMS manquants — SMS non envoyé à {$to}");
            return false;
        }

        try {
            // BulkSMS utilise Basic Auth avec Token ID comme username et Token Secret comme password
            $response = Http::withBasicAuth($tokenId, $tokenSecret)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, [
                    'to'           => $to,
                    'body'         => $message,
                    'from'         => $senderId,
                    'routingGroup' => 'ECONOMY',
                    'encoding'     => 'TEXT',
                ]);

            if ($response->successful()) {
                Log::info("[SmsService] SMS envoyé avec succès à {$to}. Réponse: " . $response->body());
                return true;
            }

            Log::error("[SmsService] Échec envoi SMS à {$to}. HTTP {$response->status()}: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("[SmsService] Exception envoi SMS à {$to}: " . $e->getMessage());
            return false;
        }
    }
}
