<?php

try {
    $count = App\Models\Dossier::where(function($q) { 
        $q->where('inspecteur_id', 1)
          ->orWhere('created_by', 1)
          ->orWhereHas('creator', function($cq) { 
              $cq->whereIn('role', ['operateur_saisie', 'chef_bureau_repr']); 
          }); 
    })->count();
    echo $count . " success\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
