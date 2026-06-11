<?php
$inspecteurs = App\Models\Dossier::whereHas('creator', function($q) { 
    $q->whereIn('role', ['inspecteur_chef', 'secretaire_inspecteur']); 
})->count();

$operateursDossiers = App\Models\Dossier::whereHas('creator', function($q) { 
    $q->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']); 
})->count();

$operateursEntries = App\Models\RepresentationEntry::count();

echo "Dossiers créés par les Inspecteurs : " . $inspecteurs . "\n";
echo "Dossiers créés par les Opérateurs de Saisie : " . $operateursDossiers . "\n";
echo "Enregistrements (RepresentationEntry) créés par Opérateurs : " . $operateursEntries . "\n";
