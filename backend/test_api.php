<?php
$req = Request::create('/api/dossiers', 'GET');
$user = App\Models\User::where('role', 'inspecteur_chef')->first();
$req->setUserResolver(function() use ($user) { return $user; });
$dossiers = app(App\Http\Controllers\DossierController::class)->index($req);
$dossiersData = json_decode($dossiers->getContent(), true);
echo "DOSSIERS_COUNT: " . count($dossiersData) . "\n";
if(count($dossiersData) > 0) {
    $id = $dossiersData[0]['id'];
    echo "FIRST_ID: " . $id . "\n";
    $req2 = Request::create('/api/dossiers/'.$id.'/details', 'GET');
    $req2->setUserResolver(function() use ($user) { return $user; });
    try {
        $res = app(App\Http\Controllers\DossierController::class)->details($req2, $id);
        echo "DETAILS_STATUS: " . $res->getStatusCode() . "\n";
    } catch(\Exception $e) {
        echo "DETAILS_ERROR: " . $e->getMessage() . "\n";
    }
}
