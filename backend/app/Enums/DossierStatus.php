<?php

namespace App\Enums;

enum DossierStatus: string
{
    case BROUILLON = 'brouillon';
    case ATTENTE_PAIEMENT = 'attente_paiement';
    case PAYE = 'paye';
    case VALIDATION_INSPECTEUR = 'validation_inspecteur';
    case EN_COURS = 'en_cours';
    case CONTROLE = 'controle';
    case VERIFIE = 'verifie';
    case VERIFICATION = 'verification';
    case APPUREMENT_ADMINISTRATIF = 'appurement_administratif';
    case APPUREMENT_FINAL = 'appurement_final';
    case TERMINE = 'termine';
}
