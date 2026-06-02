<?php
$token = "11|VDRKrhnATA6sB1OCvLds7unVxTif3Gv8sHFZEYna1db21995";
$opts = [
    "http" => [
        "method" => "GET",
        "header" => "Accept: application/json\r\n" .
                    "Authorization: Bearer " . $token . "\r\n"
    ]
];
$context = stream_context_create($opts);
$result = file_get_contents("http://localhost:8000/api/dossiers", false, $context);
$data = json_decode($result, true);
echo "Count: " . count($data) . "\n";
foreach(array_slice($data, 0, 5) as $d) {
    echo "ID: " . $d['id'] . " | Creator Role: " . ($d['creator']['role'] ?? 'N/A') . " | Ref: " . $d['reference'] . "\n";
}
