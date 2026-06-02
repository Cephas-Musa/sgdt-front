<?php
$dossiers = App\Models\Dossier::with('creator')->where('inspecteur_id', 1)->orWhere('created_by', 1)->get()->toArray();
echo json_encode(array_slice($dossiers, 0, 2), JSON_PRETTY_PRINT);
