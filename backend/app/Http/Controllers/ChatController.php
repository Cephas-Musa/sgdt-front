<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     */
    public function indexConversations(Request $request)
    {
        $user = $request->user();
        
        $conversations = $user->conversations()
            ->with(['users' => function($q) use ($user) {
                // Exclude the current user from the participant listing for 1-1 chats
                $q->where('users.id', '!=', $user->id);
            }, 'messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->get()
            ->map(function ($convo) use ($user) {
                $lastMsg = $convo->messages->first();
                
                // For 1-1, use participant's name if convo name is empty
                $name = $convo->name;
                if (!$convo->is_group && empty($name)) {
                    $otherUser = $convo->users->first();
                    $name = $otherUser ? $otherUser->full_name : 'Utilisateur';
                }

                return [
                    'id' => $convo->id,
                    'name' => $name,
                    'is_group' => $convo->is_group,
                    'last_message' => $lastMsg ? $lastMsg->content : '',
                    'last_message_date' => $lastMsg ? $lastMsg->created_at : $convo->created_at,
                    'unread' => 0, // Simplified unread simulation
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Get messages of a conversation.
     */
    public function conversationMessages(Request $request, $id)
    {
        $user = $request->user();
        $conversation = $user->conversations()->findOrFail($id);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) use ($user) {
                return [
                    'id' => $msg->id,
                    'content' => $msg->content,
                    'created_at' => $msg->created_at,
                    'sender_id' => $msg->sender_id,
                    'sender_name' => $msg->sender->full_name,
                    'sender_role' => $msg->sender->role,
                    'is_me' => $msg->sender_id === $user->id,
                ];
            });

        return response()->json($messages);
    }

    /**
     * Start a new conversation.
     */
    public function createConversation(Request $request)
    {
        $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'integer|exists:users,id',
            'name' => 'nullable|string|max:255',
            'is_group' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $isGroup = $request->input('is_group', false);
        $participantIds = $request->input('participant_ids');
        
        // Always include current user as participant
        $allParticipantIds = array_unique(array_merge([$user->id], $participantIds));

        // For 1-1, check if conversation already exists
        if (!$isGroup && count($allParticipantIds) === 2) {
            $otherUserId = $participantIds[0];
            $existing = Conversation::where('is_group', false)
                ->whereHas('users', function ($q) use ($user) {
                    $q->where('users.id', $user->id);
                })
                ->whereHas('users', function ($q) use ($otherUserId) {
                    $q->where('users.id', $otherUserId);
                })
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'Conversation déjà existante.',
                    'id' => $existing->id,
                ]);
            }
        }

        DB::beginTransaction();
        try {
            $convo = Conversation::create([
                'name' => $request->input('name'),
                'is_group' => $isGroup,
            ]);

            $convo->users()->attach($allParticipantIds);

            DB::commit();

            return response()->json([
                'message' => 'Conversation créée.',
                'id' => $convo->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $user = $request->user();
        $conversation = $user->conversations()->findOrFail($id);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $request->input('content'),
        ]);

        return response()->json([
            'id' => $message->id,
            'content' => $message->content,
            'created_at' => $message->created_at,
            'sender_id' => $message->sender_id,
            'sender_name' => $user->full_name,
            'sender_role' => $user->role,
            'is_me' => true,
        ], 201);
    }
}
