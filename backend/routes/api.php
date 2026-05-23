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
});

// Routes protégées par Sanctum (Authentification par jeton)
Route::middleware('auth:sanctum')->group(function () {

    // Profil utilisateur et déconnexion
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestion de la configuration (SuperAdmin)
    Route::prefix('config')->group(function () {
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
    });

    // Gestion des comptes utilisateurs (Admin uniquement)
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'destroy']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);

    // Gestion des Dossiers de Transit
    Route::apiResource('dossiers', DossierController::class);
    Route::patch('/dossiers/{id}/status', [DossierController::class, 'updateStatus']);

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
        Route::get('/{id}', [EntrepotController::class, 'show']);
        Route::get('/{id}/movements', [EntrepotController::class, 'movements']);
        Route::post('/{id}/denumbrement', [EntrepotController::class, 'createDenumbrement']);
        Route::get('/{id}/deneumbrement', [EntrepotController::class, 'getDenumbrements']);
        Route::post('/{id}/decharge', [EntrepotController::class, 'createDecharge']);
        Route::patch('/{id}/decharge/{dechargeId}', [EntrepotController::class, 'updateDecharge']);
    });

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
});

