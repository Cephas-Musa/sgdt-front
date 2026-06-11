<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AlerteService;

class CheckAlertes extends Command
{
    protected $signature = 'alertes:check';
    protected $description = 'Exécute toutes les règles métier d\'alertes et crée les notifications';

    public function handle(AlerteService $alerteService): int
    {
        $this->info('Exécution des règles métier d\'alertes...');

        $created = $alerteService->runAllBusinessRules();

        $total = count($created);
        $this->info("{$total} alerte(s) créée(s).");

        return Command::SUCCESS;
    }
}
