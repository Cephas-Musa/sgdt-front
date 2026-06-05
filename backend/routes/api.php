<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\MouvementController;
use App\Http\Controllers\AlerteController;
use App\Http\Controllers\BarriereController;
use App\Http\Controllers\ManifestController;
use App\Http\Controllers\ColisageController;
use App\Http\Controllers\ApurementController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\EntrepotController;
use App\Http\Controllers\VracController;
use App\Http\Controllers\DenombrementController;
use App\Http\Controllers\DechargeController;
use App\Http\Controllers\MouvementStockageController;
use App\Http\Controllers\PartenaireController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques d'authentification
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

// Routes publiques de configuration
Route::prefix('config')->group(function () {
    Route::get('/countries', [ConfigurationController::class, 'getCountries']);
    Route::get('/currencies', [ConfigurationController::class, 'getCurrencies']);
    Route::get('/customs-offices', [ConfigurationController::class, 'getCustomsOffices']);
    Route::get('/representation-offices', [ConfigurationController::class, 'getRepresentationOffices']);
    Route::get('/provincial-directions', [ConfigurationController::class, 'getProvincialDirections']);
    Route::get('/locodes', [ConfigurationController::class, 'getLocodes']);
    Route::get('/warehouses', [ConfigurationController::class, 'getWarehouses']);
    Route::get('/types-dossiers', [ConfigurationController::class, 'getTypesDossiers']);
    Route::get('/entry-points', [ConfigurationController::class, 'getEntryPoints']);
    Route::get('/exit-points', [ConfigurationController::class, 'getExitPoints']);
});

// Routes protégées par Sanctum (Authentification par jeton)
Route::middleware('auth:sanctum')->group(function () {

    // Profil utilisateur et déconnexion
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/password/change', [\App\Http\Controllers\ProfileController::class, 'changePassword']);

    // Gestion de la configuration (SuperAdmin)
    Route::prefix('config')->group(function () {
        
    Route::post('/countries', [ConfigurationController::class, 'storeCountry']);
    Route::put('/countries/{id}', [ConfigurationController::class, 'updateCountry']);
    Route::delete('/countries/{id}', [ConfigurationController::class, 'destroyCountry']);
    
    Route::post('/currencies', [ConfigurationController::class, 'storeCurrency']);
    Route::put('/currencies/{id}', [ConfigurationController::class, 'updateCurrency']);
    Route::delete('/currencies/{id}', [ConfigurationController::class, 'destroyCurrency']);
    
    Route::post('/locodes', [ConfigurationController::class, 'storeLocode']);
    Route::put('/locodes/{id}', [ConfigurationController::class, 'updateLocode']);
    Route::delete('/locodes/{id}', [ConfigurationController::class, 'destroyLocode']);

        Route::post('/customs-offices', [ConfigurationController::class, 'storeCustomsOffice']);
        Route::put('/customs-offices/{id}', [ConfigurationController::class, 'updateCustomsOffice']);
        Route::delete('/customs-offices/{id}', [ConfigurationController::class, 'destroyCustomsOffice']);

        Route::post('/representation-offices', [ConfigurationController::class, 'storeRepresentationOffice']);
        Route::put('/representation-offices/{id}', [ConfigurationController::class, 'updateRepresentationOffice']);
        Route::delete('/representation-offices/{id}', [ConfigurationController::class, 'destroyRepresentationOffice']);

        Route::post('/provincial-directions', [ConfigurationController::class, 'storeProvincialDirection']);
        Route::put('/provincial-directions/{id}', [ConfigurationController::class, 'updateProvincialDirection']);
        Route::delete('/provincial-directions/{id}', [ConfigurationController::class, 'destroyProvincialDirection']);

        Route::post('/warehouses', [ConfigurationController::class, 'storeWarehouse']);
        Route::put('/warehouses/{id}', [ConfigurationController::class, 'updateWarehouse']);
        Route::delete('/warehouses/{id}', [ConfigurationController::class, 'destroyWarehouse']);

        Route::post('/types-dossiers', [ConfigurationController::class, 'storeTypeDossier']);
        Route::put('/types-dossiers/{id}', [ConfigurationController::class, 'updateTypeDossier']);
        Route::delete('/types-dossiers/{id}', [ConfigurationController::class, 'destroyTypeDossier']);

        Route::get('/entry-points', [ConfigurationController::class, 'getEntryPoints']);
        Route::post('/entry-points', [ConfigurationController::class, 'storeEntryPoint']);
        Route::put('/entry-points/{id}', [ConfigurationController::class, 'updateEntryPoint']);
        Route::delete('/entry-points/{id}', [ConfigurationController::class, 'destroyEntryPoint']);

        Route::get('/exit-points', [ConfigurationController::class, 'getExitPoints']);
        Route::post('/exit-points', [ConfigurationController::class, 'storeExitPoint']);
        Route::put('/exit-points/{id}', [ConfigurationController::class, 'updateExitPoint']);
        Route::delete('/exit-points/{id}', [ConfigurationController::class, 'destroyExitPoint']);
    });

    // Gestion des comptes utilisateurs (Admin uniquement)
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'destroy']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::post('/users/{id}/topup', [UserController::class, 'topupWallet']);

    // Gestion des partenaires
    Route::apiResource('partenaires', PartenaireController::class);

    // Gestion des Dossiers de Transit
    Route::get('/dossiers/search/{reference}', [DossierController::class, 'search']);
    Route::get('/dossiers/history', [DossierController::class, 'history']);
    Route::get('/dossiers/next-reference', [DossierController::class, 'nextReference']);
    Route::get('/dossiers/{id}/details', [DossierController::class, 'details']);
    Route::get('/dossiers/{id}/aggregate', [DossierController::class, 'aggregate']);
    Route::apiResource('dossiers', DossierController::class);
    Route::patch('/dossiers/{id}/status', [DossierController::class, 'updateStatus']);
    
    // Actions spécifiques aux Dossiers (Workflows)
    Route::post('/dossiers/{id}/infos', [\App\Http\Controllers\DossierActionController::class, 'updateInfos']);
    Route::post('/dossiers/{id}/verification', [\App\Http\Controllers\DossierActionController::class, 'submitVerification']);
    Route::post('/dossiers/{id}/anomaly', [\App\Http\Controllers\DossierActionController::class, 'flagAnomaly']);
    Route::post('/dossiers/{id}/representation', [\App\Http\Controllers\DossierActionController::class, 'addRepresentationData']);
    Route::post('/dossiers/{id}/barriere', [\App\Http\Controllers\DossierActionController::class, 'linkBarriereData']);

    // Chat Contextuel par Dossier
    Route::get('/dossiers/{id}/chat', [\App\Http\Controllers\DossierChatController::class, 'index']);
    Route::post('/dossiers/{id}/chat', [\App\Http\Controllers\DossierChatController::class, 'store']);

    // Mouvements Brigadier (Entrées/Sorties, VRAC)
    Route::apiResource('mouvements', MouvementController::class)->only(['index', 'store', 'show']);

    // Système d'Alertes et Notifications
    Route::get('/alertes', [AlerteController::class, 'index']);
    Route::patch('/alertes/{id}/read', [AlerteController::class, 'markAsRead']);
    Route::patch('/alertes/{id}/acknowledge', [AlerteController::class, 'acknowledge']);
    Route::patch('/alertes/{id}/resolve', [AlerteController::class, 'resolve']);
    Route::get('/alertes/unread-count', [AlerteController::class, 'unreadCount']);
    Route::get('/alertes/critical', [AlerteController::class, 'critical']);

    // Gestion des Barrières & passages
    Route::apiResource('barriere-entries', BarriereController::class)->only(['index', 'store']);

    // Manifestes de camions vides
    Route::apiResource('empty-manifests', ManifestController::class)->only(['index', 'store']);
    Route::post('/empty-manifests/{id}/pay', [ManifestController::class, 'pay']);

    // Colisage (Packing List)
    Route::get('/colisage/affectations', [ColisageController::class, 'indexAffectations']);
    Route::post('/colisage/affectations', [ColisageController::class, 'storeAffectation']);
    Route::get('/colisage/rapports', [ColisageController::class, 'indexRapports']);
    Route::post('/colisage/rapports', [ColisageController::class, 'storeRapport']);
    Route::get('/colisage/rapports/dossier/{dossierId}', [ColisageController::class, 'showRapportByDossier']);
    Route::patch('/colisage/rapports/{id}/status', [ColisageController::class, 'updateRapportStatus']);

    // Apurements (Clearance)
    Route::apiResource('apurements', ApurementController::class)->only(['index', 'store']);
    Route::patch('/apurements/{id}/status', [ApurementController::class, 'updateStatus']);

    // Messagerie (Chat)
    Route::get('/chat/conversations', [ChatController::class, 'indexConversations']);
    Route::post('/chat/conversations', [ChatController::class, 'createConversation']);
    Route::get('/chat/conversations/{id}/messages', [ChatController::class, 'conversationMessages']);
    Route::post('/chat/conversations/{id}/messages', [ChatController::class, 'sendMessage']);

    // Rapports (rapports_dossiers, rapports_financiers, rapports_appurements, etc.)
    Route::prefix('reports')->group(function () {
        Route::get('/dossiers', [ReportController::class, 'dossierReport']);
        Route::get('/financial', [ReportController::class, 'financialReport']);
        Route::get('/clearances', [ReportController::class, 'clearanceReport']);
        Route::get('/agents-performance', [ReportController::class, 'agentPerformanceReport']);
        Route::get('/vehicle-movements', [ReportController::class, 'vehicleMovementReport']);
        Route::get('/alerts', [ReportController::class, 'alertReport']);
    });

    // Entrepôts et stockage
    Route::prefix('warehouses')->group(function () {
        Route::get('/', [EntrepotController::class, 'index']);
        Route::post('/', [EntrepotController::class, 'store']);
        Route::get('/{id}', [EntrepotController::class, 'show']);
        Route::put('/{id}', [EntrepotController::class, 'update']);
        Route::delete('/{id}', [EntrepotController::class, 'destroy']);
        Route::get('/{id}/movements', [EntrepotController::class, 'movements']);
        Route::post('/{id}/denumbrement', [EntrepotController::class, 'createDenumbrement']);
        Route::get('/{id}/deneumbrement', [EntrepotController::class, 'getDenumbrements']);
        Route::post('/{id}/decharge', [EntrepotController::class, 'createDecharge']);
        Route::patch('/{id}/decharge/{dechargeId}', [EntrepotController::class, 'updateDecharge']);
    });

    // Upload de fichiers (protégé par auth)
    Route::post('/upload', [\App\Http\Controllers\UploadController::class, 'store'])->middleware('auth:sanctum');

    // Barrières
    Route::prefix('barriers')->group(function () {
        Route::get('/', [BarriereController::class, 'indexBarrieres']);
        Route::get('/{id}', [BarriereController::class, 'showBarriere']);
        Route::get('/{id}/balance', [BarriereController::class, 'getBalance']);
        Route::get('/{id}/movements', [BarriereController::class, 'getMovements']);
        Route::post('/{id}/record-entry', [BarriereController::class, 'recordEntry']);
        Route::post('/{id}/record-exit', [BarriereController::class, 'recordExit']);
    });

    // Vracs
    Route::prefix('vracs')->group(function () {
        Route::get('/', [VracController::class, 'index']);
        Route::post('/', [VracController::class, 'store']);
        Route::get('/{id}', [VracController::class, 'show']);
        Route::patch('/{id}/status', [VracController::class, 'updateStatus']);
    });

    // Appurements - Endpoints additionnels
    Route::prefix('apurements')->group(function () {
        Route::get('/{id}/details', [ApurementController::class, 'show']);
        Route::patch('/{id}/approve', [ApurementController::class, 'approve']);
        Route::patch('/{id}/reject', [ApurementController::class, 'reject']);
    });

    // Dénombrements
    Route::prefix('denombrements')->group(function () {
        Route::get('/', [DenombrementController::class, 'index']);
        Route::post('/', [DenombrementController::class, 'store']);
        Route::get('/{id}', [DenombrementController::class, 'show']);
        Route::patch('/{id}/status', [DenombrementController::class, 'updateStatus']);
        Route::post('/{id}/approve', [DenombrementController::class, 'approve']);
    });

    // Décharges
    Route::prefix('decharges')->group(function () {
        Route::get('/', [DechargeController::class, 'index']);
        Route::post('/', [DechargeController::class, 'store']);
        Route::get('/{id}', [DechargeController::class, 'show']);
        Route::patch('/{id}/status', [DechargeController::class, 'updateStatus']);
    });

    // Mouvements de stockage
    Route::prefix('stockage-movements')->group(function () {
        Route::get('/', [MouvementStockageController::class, 'index']);
        Route::post('/', [MouvementStockageController::class, 'store']);
        Route::get('/{id}', [MouvementStockageController::class, 'show']);
    });

    // Alertes - endpoints additionnels
    Route::prefix('alerts')->group(function () {
        Route::get('/{id}/acknowledge', [AlerteController::class, 'acknowledge']);
        Route::patch('/{id}/resolve', [AlerteController::class, 'resolve']);
    });

    // Transactions et Portefeuille
    Route::post('/wallet/recharge', [TransactionController::class, 'rechargeWallet']);
    Route::get('/transactions', [TransactionController::class, 'indexTransactions']);

    // ─── Représentation — données complètes ───────────────────────────────────
    Route::prefix('representation')->group(function () {
        Route::get('/', [\App\Http\Controllers\RepresentationEntryController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\RepresentationEntryController::class, 'stats']);
        Route::get('/dossier/{dossierId}', [\App\Http\Controllers\RepresentationEntryController::class, 'showByDossier']);
        Route::post('/dossier/{dossierId}', [\App\Http\Controllers\RepresentationEntryController::class, 'store']);
    });

    // ─── Typing Docs (Barrière Étranger) ─────────────────────────────────────
    Route::prefix('typing-docs')->group(function () {
        Route::get('/', [\App\Http\Controllers\TypingDocController::class, 'indexDirect']);
        Route::get('/stats', [\App\Http\Controllers\TypingDocController::class, 'getDashboardStats']);
        Route::get('/dossier/{dossierId}', [\App\Http\Controllers\TypingDocController::class, 'indexByDossier']);
        Route::post('/direct', [\App\Http\Controllers\TypingDocController::class, 'storeDirect']);
        Route::post('/transhipment', [\App\Http\Controllers\TypingDocController::class, 'storeTranshipment']);
        Route::patch('/{docId}/link', [\App\Http\Controllers\TypingDocController::class, 'linkToDossier']);
    });

    // ─── IT Entries (Inventory Transit) ──────────────────────────────────────
    Route::prefix('it-entries')->group(function () {
        Route::get('/', [\App\Http\Controllers\ItEntryController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\ItEntryController::class, 'store']);
        Route::get('/dossier/{dossierId}', [\App\Http\Controllers\ItEntryController::class, 'showByDossier']);
    });

    // ─── Barrières de Contrôle (Inspecteur Chef → Brigadier Contrôle) ──
    Route::prefix('barrieres-controle')->group(function () {
        Route::get('/', [\App\Http\Controllers\BarriereControleController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\BarriereControleController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\BarriereControleController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\BarriereControleController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\BarriereControleController::class, 'destroy']);
        Route::get('/{id}/activities', [\App\Http\Controllers\BarriereControleController::class, 'activities']);
        Route::get('/{id}/dossiers', [\App\Http\Controllers\BarriereControleController::class, 'dossiers']);
    });

    // ─── Dossiers de Contrôle (Brigadier Contrôle) ──────────────────────
    Route::prefix('dossiers-controle')->group(function () {
        Route::get('/', [\App\Http\Controllers\DossierControleController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\DossierControleController::class, 'store']);
        Route::get('/search', [\App\Http\Controllers\DossierControleController::class, 'search']);
        Route::get('/{id}', [\App\Http\Controllers\DossierControleController::class, 'show']);
    });

    // ─── Barrière — Commissions ─────────────────────────────────────────
    Route::prefix('commissions')->group(function () {
        Route::get('/', [\App\Http\Controllers\CommissionController::class, 'index']);
        Route::post('/calculate', [\App\Http\Controllers\CommissionController::class, 'calculate']);
        Route::post('/{id}/approve', [\App\Http\Controllers\CommissionController::class, 'approve']);
        Route::post('/{id}/pay', [\App\Http\Controllers\CommissionController::class, 'pay']);
        Route::post('/{id}/cancel', [\App\Http\Controllers\CommissionController::class, 'cancel']);
        Route::get('/stats', [\App\Http\Controllers\CommissionController::class, 'stats']);
        Route::get('/operator/{operatorId}/balance', [\App\Http\Controllers\CommissionController::class, 'operatorBalance']);
    });
});

// Routes versionnées /api/v1/barrier/*
Route::prefix('v1/barrier')->middleware('auth:sanctum')->group(function () {
    // Barrières (master)
    Route::get('/barrieres', [\App\Http\Controllers\BarriereController::class, 'indexBarrieres']);
    Route::get('/barrieres/{id}', [\App\Http\Controllers\BarriereController::class, 'showBarriere']);
    Route::get('/barrieres/{id}/balance', [\App\Http\Controllers\BarriereController::class, 'getBalance']);
    Route::get('/barrieres/{id}/movements', [\App\Http\Controllers\BarriereController::class, 'getMovements']);

    // Mouvements (entrées/sorties)
    Route::post('/barrieres/{id}/entry', [\App\Http\Controllers\BarriereController::class, 'recordEntry']);
    Route::post('/barrieres/{id}/exit', [\App\Http\Controllers\BarriereController::class, 'recordExit']);

    // Typing Docs
    Route::get('/typing-docs/dossier/{dossierId}', [\App\Http\Controllers\TypingDocController::class, 'indexByDossier']);
    Route::post('/typing-docs/direct', [\App\Http\Controllers\TypingDocController::class, 'storeDirect']);
    Route::post('/typing-docs/transhipment', [\App\Http\Controllers\TypingDocController::class, 'storeTranshipment']);
    Route::patch('/typing-docs/{docId}/link', [\App\Http\Controllers\TypingDocController::class, 'linkToDossier']);

    // IT Entries
    Route::get('/it-entries', [\App\Http\Controllers\ItEntryController::class, 'index']);
    Route::post('/it-entries', [\App\Http\Controllers\ItEntryController::class, 'store']);
    Route::get('/it-entries/dossier/{dossierId}', [\App\Http\Controllers\ItEntryController::class, 'showByDossier']);

    // Empty Manifests
    Route::get('/empty-manifests', [\App\Http\Controllers\ManifestController::class, 'index']);
    Route::post('/empty-manifests', [\App\Http\Controllers\ManifestController::class, 'store']);
    Route::post('/empty-manifests/{id}/pay', [\App\Http\Controllers\ManifestController::class, 'pay']);

    // Commissions
    Route::get('/commissions', [\App\Http\Controllers\CommissionController::class, 'index']);
    Route::post('/commissions/calculate', [\App\Http\Controllers\CommissionController::class, 'calculate']);
    Route::post('/commissions/{id}/approve', [\App\Http\Controllers\CommissionController::class, 'approve']);
    Route::post('/commissions/{id}/pay', [\App\Http\Controllers\CommissionController::class, 'pay']);
    Route::post('/commissions/{id}/cancel', [\App\Http\Controllers\CommissionController::class, 'cancel']);
    Route::get('/commissions/stats', [\App\Http\Controllers\CommissionController::class, 'stats']);
    Route::get('/commissions/operator/{operatorId}/balance', [\App\Http\Controllers\CommissionController::class, 'operatorBalance']);

    // Stats
    Route::get('/typing-docs/stats', [\App\Http\Controllers\TypingDocController::class, 'getDashboardStats']);
});


Route::get('/test-ref', function() { return \App\Services\ReferenceGeneratorService::generate(); });
