<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dossier;
use App\Models\DossierMessage;

class DossierChatController extends Controller
{
    /**
     * Récupérer les messages liés au dossier
     */
    public function index(Request $request, $dossierId)
    {
        // On pourrait vérifier si l'user a accès au dossier
        $messages = DossierMessage::with('sender')
            ->where('dossier_id', $dossierId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Ajouter un message au chat du dossier
     */
    public function store(Request $request, $dossierId)
    {
        $dossier = Dossier::findOrFail($dossierId);
        $user = $request->user();

        $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|string',
        ]);

        $msg = DossierMessage::create([
            'dossier_id' => $dossier->id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'attachment' => $request->attachment,
        ]);

        return response()->json(['message' => 'Message envoyé.', 'data' => $msg->load('sender')]);
    }
}
