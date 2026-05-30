<?php

namespace App\Enums;

enum ValidationType: string
{
    case INSPECTION = 'inspection';
    case VERIFICATION = 'verification';
    case ENTREPOT = 'entrepot';
    case SORTIE = 'sortie';
    case CONTROLE = 'controle';
    case FINAL = 'final';
}
