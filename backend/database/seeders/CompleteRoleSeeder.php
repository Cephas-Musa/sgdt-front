<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\DirectionProvinciale;
use App\Models\BureauDouanier;
use App\Models\BureauRepresentation;
use App\Models\Barriere;
use App\Models\Entrepot;

class CompleteRoleSeeder extends Seeder
{
    /**
     * Seed the application's database with all roles.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // ─── 1. SUPER ADMIN ────────────────────────────────────────────────
        $superAdmin = User::updateOrCreate(
            ['phone_number' => '+243813478556'],
            [
                'password' => Hash::make('Dragon@2004'),
                'role' => 'super_admin',
                'full_name' => 'Super Administrateur SGDT',
                'matricule' => 'SA-2026-0001',
                'phone_verified_at' => now(),
                'wallet_balance' => 0.00,
                'status' => 'actif',
            ]
        );

        // ─── 2. DIRECTEUR GÉNÉRAL (DG) ─────────────────────────────────────
        $dg = User::updateOrCreate(
            ['phone_number' => '+243811234567'],
            [
                'password' => Hash::make('DG@Secure2024'),
                'role' => 'directeur_general',
                'full_name' => 'Directeur Général',
                'bureau' => 'DIRECTION GENERALE',
                'province' => 'KINSHASA',
                'matricule' => 'DG-2026-0001',
                'phone_verified_at' => now(),
                'created_by' => $superAdmin->id,
                'parent_id' => $superAdmin->id,
                'status' => 'actif',
            ]
        );

        // ─── 3. DIRECTEURS PROVINCIAUX (DP) ────────────────────────────────
        $dp1 = User::updateOrCreate(
            ['phone_number' => '+243812111111'],
            [
                'password' => Hash::make('DP@Secure2024'),
                'role' => 'directeur_provincial',
                'full_name' => 'Directeur Provincial Nord-Kivu',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'DP-NK-2026',
                'phone_verified_at' => now(),
                'created_by' => $dg->id,
                'parent_id' => $dg->id,
                'status' => 'actif',
            ]
        );

        // ─── 4. INSPECTEURS CHEF BUREAU ────────────────────────────────────
        $inspecteur1 = User::updateOrCreate(
            ['phone_number' => '+243812222222'],
            [
                'password' => Hash::make('Insp@Secure2024'),
                'role' => 'inspecteur_chef_bureau',
                'full_name' => 'Inspecteur Chef Bureau Goma',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'ICB-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $dp1->id,
                'parent_id' => $dp1->id,
                'status' => 'actif',
            ]
        );

        // ─── 5. SECRÉTAIRES INSPECTEUR ────────────────────────────────────
        $secretaire1 = User::updateOrCreate(
            ['phone_number' => '+243812333333'],
            [
                'password' => Hash::make('Sec@Secure2024'),
                'role' => 'secretaire_inspecteur',
                'full_name' => 'Secrétaire Inspecteur Goma',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'inspecteur_id' => $inspecteur1->id,
                'matricule' => 'SEC-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $inspecteur1->id,
                'parent_id' => $inspecteur1->id,
                'status' => 'actif',
            ]
        );

        // ─── 6. CHEF BUREAU REPRÉSENTATION ────────────────────────────────
        $chefBureauRepr = User::updateOrCreate(
            ['phone_number' => '+243812444444'],
            [
                'password' => Hash::make('CBR@Secure2024'),
                'role' => 'chef_bureau_representation',
                'full_name' => 'Chef Bureau Représentation Mpondwe',
                'bureau_representation_id' => 'br1',
                'matricule' => 'CBR-MP-2026',
                'phone_verified_at' => now(),
                'created_by' => $dg->id,
                'parent_id' => $dg->id,
                'status' => 'actif',
            ]
        );

        // ─── 7. OPÉRATEUR SAISIE ──────────────────────────────────────────
        $operateurSaisie = User::updateOrCreate(
            ['phone_number' => '+243812555555'],
            [
                'password' => Hash::make('Op@Secure2024'),
                'role' => 'operateur_saisie',
                'full_name' => 'Opérateur Saisie Mpondwe',
                'bureau_representation_id' => 'br1',
                'chef_bureau_representation_id' => $chefBureauRepr->id,
                'matricule' => 'OS-MP-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefBureauRepr->id,
                'parent_id' => $chefBureauRepr->id,
                'status' => 'actif',
            ]
        );

        // ─── 8. AGENT CONTRÔLE ────────────────────────────────────────────
        $agentControle = User::updateOrCreate(
            ['phone_number' => '+243812666666'],
            [
                'password' => Hash::make('AC@Secure2024'),
                'role' => 'agent_controle',
                'full_name' => 'Agent Cellule Contrôle',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'AC-NK-2026',
                'phone_verified_at' => now(),
                'created_by' => $dg->id,
                'parent_id' => $dg->id,
                'can_create_reports' => true,
                'status' => 'actif',
            ]
        );

        // ─── 9. CHEF BARRIÈRE ─────────────────────────────────────────────
        $chefBarriere = User::updateOrCreate(
            ['phone_number' => '+243812777777'],
            [
                'password' => Hash::make('CB@Secure2024'),
                'role' => 'chef_barriere',
                'full_name' => 'Chef Barrière Kasindi',
                'barriere_id' => 'b1',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'CB-KAS-2026',
                'phone_verified_at' => now(),
                'created_by' => $dg->id,
                'parent_id' => $dg->id,
                'can_manage_barriers' => true,
                'status' => 'actif',
            ]
        );

        // ─── 10. TYPING OPERATOR ──────────────────────────────────────────
        $typingOperator = User::updateOrCreate(
            ['phone_number' => '+243812888888'],
            [
                'password' => Hash::make('TO@Secure2024'),
                'role' => 'typing_operator',
                'full_name' => 'Typing Operator Kasindi',
                'barriere_id' => 'b1',
                'chef_barriere_id' => $chefBarriere->id,
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'TO-KAS-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefBarriere->id,
                'parent_id' => $chefBarriere->id,
                'status' => 'actif',
            ]
        );

        // ─── 11. BRIGADIER BARRIÈRE (Entrée) ───────────────────────────────
        $brigadierEntree = User::updateOrCreate(
            ['phone_number' => '+243812999999'],
            [
                'password' => Hash::make('BBE@Secure2024'),
                'role' => 'brigadier_barriere_entree',
                'full_name' => 'Brigadier Barrière Entrée Kasindi',
                'barriere_id' => 'b1',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'BBE-KAS-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefBarriere->id,
                'parent_id' => $chefBarriere->id,
                'can_manage_barriers' => true,
                'status' => 'actif',
            ]
        );

        // ─── 12. CHEF ENTREPÔT DOUANE ─────────────────────────────────────
        $chefEntrepotDouane = User::updateOrCreate(
            ['phone_number' => '+243813111111'],
            [
                'password' => Hash::make('CED@Secure2024'),
                'role' => 'chef_entrepot_douane',
                'full_name' => 'Chef Entrepôt Douane Goma',
                'entrepot_id' => 'e1',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'CED-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $inspecteur1->id,
                'parent_id' => $inspecteur1->id,
                'can_manage_warehouse' => true,
                'status' => 'actif',
            ]
        );

        // ─── 13. AGENT POINTAGE ───────────────────────────────────────────
        $agentPointage = User::updateOrCreate(
            ['phone_number' => '+243813222222'],
            [
                'password' => Hash::make('AP@Secure2024'),
                'role' => 'agent_pointage',
                'full_name' => 'Agent Pointage Goma',
                'entrepot_id' => 'e1',
                'chef_entrepot_id' => $chefEntrepotDouane->id,
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'AP-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefEntrepotDouane->id,
                'parent_id' => $chefEntrepotDouane->id,
                'status' => 'actif',
            ]
        );

        // ─── 14. CHEF VÉRIFICATION ────────────────────────────────────────
        $chefVerification = User::updateOrCreate(
            ['phone_number' => '+243813333333'],
            [
                'password' => Hash::make('CV@Secure2024'),
                'role' => 'chef_verification',
                'full_name' => 'Chef Vérification',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'CV-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $inspecteur1->id,
                'parent_id' => $inspecteur1->id,
                'can_verify_dossiers' => true,
                'status' => 'actif',
            ]
        );

        // ─── 15. VÉRIFICATEUR ──────────────────────────────────────────────
        $verificateur = User::updateOrCreate(
            ['phone_number' => '+243813444444'],
            [
                'password' => Hash::make('Ver@Secure2024'),
                'role' => 'verificateur',
                'full_name' => 'Vérificateur',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'chef_verification_id' => $chefVerification->id,
                'matricule' => 'VER-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefVerification->id,
                'parent_id' => $chefVerification->id,
                'can_verify_dossiers' => true,
                'status' => 'actif',
            ]
        );

        // ─── 16. CHEF ENTREPÔT PRIVÉ ──────────────────────────────────────
        $chefEntrepotPrive = User::updateOrCreate(
            ['phone_number' => '+243813555555'],
            [
                'password' => Hash::make('CEP@Secure2024'),
                'role' => 'chef_entrepot_prive',
                'full_name' => 'Chef Entrepôt Privé',
                'entrepot_id' => 'e2',
                'bureau' => 'GOMA VILLE',
                'bureau_id' => 'bd2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'CEP-GM-2026',
                'phone_verified_at' => now(),
                'created_by' => $inspecteur1->id,
                'parent_id' => $inspecteur1->id,
                'can_manage_warehouse' => true,
                'status' => 'actif',
            ]
        );

        // ─── 17. BRIGADIER BARRIÈRE (Sortie) ──────────────────────────────
        $brigadierSortie = User::updateOrCreate(
            ['phone_number' => '+243813666666'],
            [
                'password' => Hash::make('BBS@Secure2024'),
                'role' => 'brigadier_barriere_sortie',
                'full_name' => 'Brigadier Barrière Sortie',
                'barriere_id' => 'b2',
                'province' => 'NORD-KIVU',
                'province_id' => 'dp1',
                'matricule' => 'BBS-MP-2026',
                'phone_verified_at' => now(),
                'created_by' => $chefBarriere->id,
                'parent_id' => $chefBarriere->id,
                'can_manage_barriers' => true,
                'status' => 'actif',
            ]
        );

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "✅ Seeder complet exécuté avec succès!\n";
        echo "15 utilisateurs créés couvrant tous les rôles de la hiérarchie SGDT.\n";
    }
}
