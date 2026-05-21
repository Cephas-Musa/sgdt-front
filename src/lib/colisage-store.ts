// Store léger pour partager les rapports de colisage soumis entre les rôles
// En prod, ceci serait remplacé par une API backend

export interface ColisageLigne {
  id: string;
  description: string;
  quantite: number;
  poidsParColis: number;
  poidsTotal: number;
}

export interface RapportColisage {
  id: string;
  dossierId: string;
  dossierRef: string;
  importateur: string;
  typeDossier: string;
  dateCreation: string;
  dateSoumission: string;
  agentId: string;
  agentNom: string;
  lignes: ColisageLigne[];
  lignesChef?: ColisageLigne[]; // version modifiée par le chef (distincte de l'agent)
  totalQuantite: number;
  totalPoids: number;
  notes: string;
  notesChef?: string;
  statut: "soumis" | "validé" | "rejeté";
}

// Affectation d'un agent à un dossier
export interface AffectationAgent {
  id: string;
  dossierId: string;
  dossierRef: string;
  vehicule: string;
  agentId: string;
  agentNom: string;
  dateAffectation: string;
}

// Tableaux mutables partagés (simulés en mémoire)
export const RAPPORTS_COLISAGE: RapportColisage[] = [];
export const AFFECTATIONS: AffectationAgent[] = [];

export function soumettrRapport(rapport: Omit<RapportColisage, "id" | "dateSoumission" | "statut">): RapportColisage {
  const nouveau: RapportColisage = {
    ...rapport,
    id: `RC-${Date.now()}`,
    dateSoumission: new Date().toLocaleDateString("fr-FR"),
    statut: "soumis",
  };
  RAPPORTS_COLISAGE.unshift(nouveau);
  return nouveau;
}

export function affecterAgent(data: Omit<AffectationAgent, "id" | "dateAffectation">): AffectationAgent {
  // Supprimer l'affectation précédente pour ce dossier si elle existe
  const idx = AFFECTATIONS.findIndex((a) => a.dossierId === data.dossierId);
  if (idx !== -1) AFFECTATIONS.splice(idx, 1);

  const affectation: AffectationAgent = {
    ...data,
    id: `AFF-${Date.now()}`,
    dateAffectation: new Date().toLocaleDateString("fr-FR"),
  };
  AFFECTATIONS.unshift(affectation);
  return affectation;
}

export function getDossiersAgent(agentId: string): string[] {
  return AFFECTATIONS.filter((a) => a.agentId === agentId).map((a) => a.dossierId);
}

export function getAffectationDossier(dossierId: string): AffectationAgent | undefined {
  return AFFECTATIONS.find((a) => a.dossierId === dossierId);
}

export function getRapportDossier(dossierId: string): RapportColisage | undefined {
  return RAPPORTS_COLISAGE.find((r) => r.dossierId === dossierId);
}
