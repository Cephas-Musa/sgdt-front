<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Dossier;
use App\Models\Article;
use App\Models\BureauDouanier;
use App\Models\EmptyManifest;
use App\Models\ColisageAffectation;
use App\Models\RapportColisage;
use App\Models\Apurement;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Transaction;
use App\Models\PartenaireTransaction;
use App\Models\BarriereEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class CompleteSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $superadmin;
    private User $operateur;
    private User $pointageAgent;
    private User $secretaire;
    private User $inspecteur;
    private User $partenaire;
    private BureauDouanier $bureau;
    private Dossier $dossier;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup common test actors
        $this->superadmin = User::create([
            'phone_number' => '+243813478556',
            'password' => bcrypt('Dragon@2004'),
            'role' => 'super_admin',
            'full_name' => 'Superadmin SGDT',
            'phone_verified_at' => now(),
            'wallet_balance' => 1000.00
        ]);

        $this->operateur = User::create([
            'phone_number' => '+243991001001',
            'password' => bcrypt('Password@123'),
            'role' => 'operateur_saisie',
            'full_name' => 'Operateur Saisie',
            'phone_verified_at' => now(),
            'wallet_balance' => 100.00
        ]);

        $this->pointageAgent = User::create([
            'phone_number' => '+243991001009',
            'password' => bcrypt('Password@123'),
            'role' => 'agent_pointage',
            'full_name' => 'Agent Pointage',
            'phone_verified_at' => now(),
            'wallet_balance' => 0.00
        ]);

        $this->secretaire = User::create([
            'phone_number' => '+243991001004',
            'password' => bcrypt('Password@123'),
            'role' => 'secretaire_inspecteur',
            'full_name' => 'Secretaire',
            'phone_verified_at' => now(),
            'wallet_balance' => 0.00
        ]);

        $this->inspecteur = User::create([
            'phone_number' => '+243991001005',
            'password' => bcrypt('Password@123'),
            'role' => 'inspecteur_chef',
            'full_name' => 'Inspecteur Chef',
            'phone_verified_at' => now(),
            'wallet_balance' => 0.00
        ]);

        $this->secretaire->parent_id = $this->inspecteur->id;
        $this->secretaire->save();

        $this->partenaire = User::create([
            'phone_number' => '+243991001016',
            'password' => bcrypt('Password@123'),
            'role' => 'partenaire',
            'full_name' => 'Partenaire',
            'phone_verified_at' => now(),
            'wallet_balance' => 0.00
        ]);

        // Create reference office
        $this->bureau = BureauDouanier::create([
            'id' => 'bd1',
            'code' => '617B',
            'denomination' => 'KASINDI',
            'icb' => 'ICB Nord-Kivu',
            'province' => 'NORD-KIVU',
            'manifest_price' => 25.00
        ]);

        // Create standard test dossier
        $this->dossier = Dossier::create([
            'id' => 'D-TEST-001',
            'reference' => 'RD-TEST-001',
            'reference_douane' => 'E-TEST-101',
            'importateur' => 'Societe Importateur',
            'declarant' => 'Transit Express',
            'nif' => 'NIF-1112223',
            'type' => 'direct',
            'dra' => 'E-TEST-101',
            't1' => 'T1-TEST-001',
            'vehicule' => 'Actros Camion',
            'plaque' => 'CGO 9999',
            'pays' => 'UG',
            'provenance' => 'OUGANDA',
            'destination' => 'RDC',
            'localisation' => 'Mpondwe/Kasindi',
            'type_marchandises' => 'General Cargo',
            'quantite' => 10,
            'poids' => 5000.00,
            'colis' => 100,
            'devise' => 'USD',
            'status' => 'paye', // paid
            'montant' => 50.00,
            'bureau_repr' => 'KASINDI',
            'province' => 'NORD-KIVU',
            'nombre_declarations' => 1,
            'user_id' => $this->operateur->id,
        ]);
    }

    /**
     * 1. Test Configuration Endpoints
     */
    public function test_configuration_endpoints(): void
    {
        $response = $this->getJson('/api/config/customs-offices');
        $response->assertStatus(200);

        $response = $this->getJson('/api/config/countries');
        $response->assertStatus(200);
    }

    /**
     * 2. Test Wallet Transactions
     */
    public function test_wallet_recharge_and_transaction_listing(): void
    {
        // Recharge wallet
        $response = $this->actingAs($this->superadmin)
            ->postJson('/api/transactions/recharge', [
                'amount' => 500.00,
                'user_id' => $this->operateur->id,
                'description' => 'Test recharge'
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Recharge effectuée avec succès.',
                'new_balance' => 600.00 // 100 + 500
            ]);

        $this->assertEquals(600.00, $this->operateur->fresh()->wallet_balance);

        // List general transactions
        $response = $this->actingAs($this->operateur)
            ->getJson('/api/transactions');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    /**
     * 3. Test Empty Truck Manifest
     */
    public function test_empty_truck_manifest_creation_and_payment(): void
    {
        // Create Empty Manifest
        $response = $this->actingAs($this->operateur)
            ->postJson('/api/empty-manifests', [
                'plaque' => 'CGO 1122',
                'chauffeur' => 'Jean Kabila',
                'pays_provenance' => 'UG',
                'pays_destination' => 'RDC',
                'bureau_id' => 'bd1',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'manifest' => ['manifest_number', 'plaque', 'facture_statut'],
                'amount_due',
                'currency'
            ]);

        $manifestId = $response['manifest']['id'];

        // Pay for Empty Manifest
        $response = $this->actingAs($this->operateur)
            ->postJson("/api/empty-manifests/{$manifestId}/pay");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Paiement effectué avec succès.',
                'new_balance' => 75.00 // 100 - 25.00 (manifest price)
            ]);

        $this->assertEquals('paye', EmptyManifest::find($manifestId)->facture_statut);
    }

    /**
     * 4. Test Colisage (Packing List) Flow
     */
    public function test_colisage_workflow(): void
    {
        // 4.1 Assign pointing agent to dossier
        $response = $this->actingAs($this->superadmin)
            ->postJson('/api/colisage/affectations', [
                'dossier_id' => $this->dossier->id,
                'agent_id' => $this->pointageAgent->id,
            ]);

        $response->assertStatus(201);

        // 4.2 List assignments
        $response = $this->actingAs($this->pointageAgent)
            ->getJson('/api/colisage/affectations');

        $response->assertStatus(200)
            ->assertJsonCount(1);

        // 4.3 Submit packing list report
        $response = $this->actingAs($this->pointageAgent)
            ->postJson('/api/colisage/rapports', [
                'dossier_id' => $this->dossier->id,
                'lignes' => [
                    [
                        'description' => 'Colis sucre roux',
                        'quantite' => 50,
                        'poidsParColis' => 10,
                        'poidsTotal' => 500,
                    ]
                ],
                'total_quantite' => 50,
                'total_poids' => 500,
                'notes' => 'Tout est en ordre'
            ]);

        $response->assertStatus(201);

        // 4.4 List reports
        $response = $this->actingAs($this->superadmin)
            ->getJson('/api/colisage/rapports');

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $rapportId = $response[0]['id'];

        // 4.5 Validate report
        $response = $this->actingAs($this->superadmin)
            ->patchJson("/api/colisage/rapports/{$rapportId}/status", [
                'statut' => 'valide',
                'notes_chef' => 'Rapport validé',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('verifie', $this->dossier->fresh()->status);
    }

    /**
     * 5. Test Apurements (Clearances) Flow
     */
    public function test_apurement_workflow(): void
    {
        // Dossier is 'paye' by default in setUp
        $this->dossier->status = 'verifie';
        $this->dossier->save();

        // 5.1 Submit apurement
        $response = $this->actingAs($this->secretaire)
            ->postJson('/api/apurements', [
                'dossier_id' => $this->dossier->id,
                'ref_douane' => 'DOUANE-REF-777',
                'date_apurement' => now()->format('Y-m-d'),
            ]);

        $response->assertStatus(201);
        $apurementId = $response['id'];

        // 5.2 Prevent double submission
        $response = $this->actingAs($this->secretaire)
            ->postJson('/api/apurements', [
                'dossier_id' => $this->dossier->id,
                'ref_douane' => 'DOUANE-REF-777',
                'date_apurement' => now()->format('Y-m-d'),
            ]);

        $response->assertStatus(400);

        // 5.3 Inspector chef lists apurements
        $response = $this->actingAs($this->inspecteur)
            ->getJson('/api/apurements');

        $response->assertStatus(200)
            ->assertJsonCount(1);

        // 5.4 Validate apurement
        $response = $this->actingAs($this->inspecteur)
            ->patchJson("/api/apurements/{$apurementId}/status", [
                'status' => 'valide'
            ]);

        $response->assertStatus(200);
        $this->assertEquals('apure', $this->dossier->fresh()->status);
    }

    /**
     * 6. Test Chat messaging system
     */
    public function test_chat_messaging_workflow(): void
    {
        // 6.1 Create conversation
        $response = $this->actingAs($this->superadmin)
            ->postJson('/api/chat/conversations', [
                'participant_ids' => [$this->operateur->id],
                'name' => 'Assistance Technique'
            ]);

        $response->assertStatus(201);
        $convId = $response['id'];

        // 6.2 Send message
        $response = $this->actingAs($this->superadmin)
            ->postJson("/api/chat/conversations/{$convId}/messages", [
                'content' => 'Bonjour, comment puis-je vous aider ?'
            ]);

        $response->assertStatus(201);

        // 6.3 Get messages
        $response = $this->actingAs($this->operateur)
            ->getJson("/api/chat/conversations/{$convId}/messages");

        $response->assertStatus(200)
            ->assertJsonCount(1);

        // 6.4 List conversations
        $response = $this->actingAs($this->operateur)
            ->getJson('/api/chat/conversations');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    /**
     * 7. Test Barrier Passages
     */
    public function test_barrier_passages(): void
    {
        $response = $this->actingAs($this->superadmin)
            ->postJson('/api/barriere-entries', [
                'dossier_id' => $this->dossier->id,
                'barriere_name' => 'BARRIERE_KASINDI_SORTIE',
                'status' => 'litige',
                'observations' => 'Marchandise non conforme aux scellés',
            ]);

        $response->assertStatus(201);

        $response = $this->actingAs($this->superadmin)
            ->getJson('/api/barriere-entries');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }
}
