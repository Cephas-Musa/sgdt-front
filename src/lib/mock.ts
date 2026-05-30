// Mock data — frontend only. Aucune donnée fictive issue de prod.
import type { Role } from "./roles";

export type DossierStatus =
  | "brouillon"
  | "attente_paiement"
  | "paye"
  | "en_cours"
  | "verifie"
  | "apure"
  | "rejete";

export type DossierType =
  | "direct"
  | "transbordement"
  | "vrac"
  | "lot"
  | "colis"
  | "dechargement"
  | "chargement"
  | "petrolier"
  | "trafic"
  | "export"
  | "autres";

export interface Dossier {
  id: string;
  reference: string;
  referenceDouane: string;
  importateur: string;
  exportateur?: string;
  declarant: string;
  nif: string;
  type: DossierType;
  dra: string;
  t1: string;
  vehicule: string;
  plaque: string;
  pays: string;
  provenance: string;
  destination: string;
  localisation: string;
  typeMarchandises: string;
  quantite: number;
  poids: number;
  colis: number;
  devise: string;
  status: DossierStatus;
  montant: number;
  bureauRepr: string;
  date: string;
  province: string;
  nombreDeclarations: number;
  nbTitres?: number;
  nbDeclarations?: number;
  modeDeclaration?: string;
  vehiculeDe?: string;
  vehiculeA?: string;
  barriereEtranger: {
    entree: string;
    traversee: string;
    validation: string;
    transport: string;
  };
  barrierePays: {
    entree: string;
    posteDouanier: string;
    validation: string;
    mouvementsInternes: string;
  };
  donneesRepresentation: {
    bureau: string;
    importateur: string;
    referenceDra: string;
    referenceT1: string;
    typeDossier: string;
  };
  rapportColisage: {
    colis: number;
    denombrement: string;
    pointage: string;
    quantites: string;
  };
  verificationRapport: {
    resultat: string;
    observations: string;
    anomalies: string;
    commentaires: string;
  };
  sortie: {
    autorisation: string;
    bonSortie: string;
    dateSortie: string;
    destinationFinale: string;
  };
  rapportDechargement: {
    entrepot: string;
    dechargement: string;
    emplacement: string;
    statutFinal: string;
  };
  operateurSaisie?: string;
  created_by?: string;
  inspecteur_id?: string;
  secretary_id?: string;
  extra_data?: Record<string, any>;
  articles?: Article[];
  // Nouveaux champs pour Trafic et Export
  trafic?: {
    moyenTransport: "velo" | "tricycle" | "voiture" | "humain" | "autres";
    lieuEntreposage: string;
    entrepot: string;
    evaluateurs: string[];
  };
  export?: {
    exportateur: string;
    modeDeclaration: string;
    docsJoints: { designation: string; reference: string; date: string }[];
  };
  createdAt: string;
}

export interface ITEntry {
  id: string;
  reference: string;
  chassis: string;
  consignee: string;
  vehicleMark: string;
  manifestYear: number;
  color: string;
  date: string;
}

const importateurs = [
  "Société Atlas SARL",
  "Imex Trading Co.",
  "Global Cargo Ltd",
  "Sahel Logistics",
  "Kivu Import",
  "PetroPlus SA",
];
const pays = ["RDC", "OUG", "RWA", "BDI", "TZA", "KEN"];
const devises = ["USD", "EUR", "CDF"];
const types: DossierType[] = [
  "direct",
  "transbordement",
  "vrac",
  "lot",
  "petrolier",
  "trafic",
  "export",
];
const statuses: DossierStatus[] = [
  "brouillon",
  "attente_paiement",
  "paye",
  "en_cours",
  "verifie",
  "apure",
  "rejete",
];
const reprBureaux = ["MPONDWE", "CHANIKA", "KASINDI", "GOMA"];
const modesDeclaration = ["Normale", "Anticipée", "Simplifiée"];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pad(n: number, l = 4) {
  return String(n).padStart(l, "0");
}

const TARIF: Record<DossierType, number> = {
  direct: 50,
  transbordement: 50,
  vrac: 10,
  lot: 10,
  colis: 10,
  dechargement: 10,
  chargement: 10,
  petrolier: 50,
  trafic: 20,
  export: 100,
  autres: 10,
};

export const DOSSIERS: Dossier[] = [];

export const IT_ENTRIES: ITEntry[] = [];

export const TARIFS_DOSSIER = TARIF;

// ============== Comptes utilisateurs ==============
export interface Account {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  phone: string;
  status: "actif" | "désactivé";
  matricule: string;
  bureau?: string;
  province?: string;
  creePar?: string;
  dateCreation: string;
  borderCommission?: number;
  accessibleOfficeId?: string;
}

export const ACCOUNTS: Account[] = [];

// ============== Alertes ==============
export interface AlertItem {
  id: string;
  title: string;
  level: "urgent" | "important" | "info";
  type: "fraude" | "incoherence" | "paiement" | "retard";
  date: string;
  codeBureau?: string;
  nomBureau?: string;
}

export const ALERTS: AlertItem[] = [];

// ============== Chat ==============
export interface ChatThread {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  group: boolean;
}

export const CHATS: ChatThread[] = [];

// ============== Barrières ==============
export interface BarriereEntry {
  id: string;
  reference: string;
  vehicule: string;
  charge: "chargé" | "vide";
  type: "véhicule" | "vrac";
  sens: "entrée" | "sortie";
  date: string;
}

export const BARRIERE_ENTRIES: BarriereEntry[] = [];

// ============== Empty Manifest ==============
export interface EmptyManifest {
  id: string;
  reference: string;
  declarant: string;
  vehicule: string;
  marque: string;
  destination: string;
  receveur: string;
  barriereEntree: string;
  barriereSortie: string;
  status: "payé" | "barrière 1" | "barrière 2" | "cachet" | "sortie Ouganda";
  date: string;
  montant: number;
  typeVehicule?: string;
  transporteur?: string;
  lieuChargement?: string;
  proprietaire?: string;
  nomChauffeur?: string;
}

export const EMPTY_MANIFESTS: EmptyManifest[] = [];

// ============== Bureaux douaniers (créés par le DG) ==============
export interface BureauDouanier {
  id: string;
  code: string;
  denomination: string;
  icb?: string;
  province?: string;
  manifestPrice: number;
}

export const BUREAUX_DOUANIERS: BureauDouanier[] = [];

// ============== Directions provinciales ==============
export interface DirectionProvinciale {
  id: string;
  numero: number;
  denomination: string;
  nombreBureaux: number;
  directeur: string;
  telephone?: string;
  email?: string;
  dateCreation?: string;
}

export const DIRECTIONS_PROVINCIALES: DirectionProvinciale[] = [];

// ============== Bureaux de représentation (sortie / entrée pays) ==============
export interface BureauRepresentation {
  id: string;
  code: string;
  denomination: string;
  type: "sortie" | "entree";
  ville: string;
  pays: string;
  status: "actif" | "désactivé";
}
export const BUREAUX_REPR: BureauRepresentation[] = [];

// ============== Locode / Pays / Devises ==============
export interface Locode {
  id: string;
  code: string;
  designation: string;
  codePays: string;
  denomination: string;
}

export const LOCODES: Locode[] = [
  { id: "l1", code: "UGKLA", designation: "Kampala", codePays: "UG", denomination: "OUGANDA" },
  { id: "l2", code: "KENBO", designation: "Nairobi", codePays: "KE", denomination: "KENYA" },
  {
    id: "l3",
    code: "TZDAR",
    designation: "Dar es Salaam",
    codePays: "TZ",
    denomination: "TANZANIE",
  },
];

export interface Pays {
  id: string;
  code: string;
  designation: string;
}
export const PAYS: Pays[] = [
  { id: "p1", code: "UG", designation: "OUGANDA" },
  { id: "p2", code: "KE", designation: "KENYA" },
  { id: "p3", code: "RW", designation: "RWANDA" },
  { id: "p4", code: "TZ", designation: "TANZANIE" },
  { id: "p5", code: "BI", designation: "BURUNDI" },
];

export interface Devise {
  id: string;
  codePays: string;
  codeDevise: string;
  denomination: string;
}
export const DEVISES: Devise[] = [
  { id: "d1", codePays: "US", codeDevise: "USD", denomination: "Dollar Américain" },
  { id: "d2", codePays: "EU", codeDevise: "EUR", denomination: "Euro" },
  { id: "d3", codePays: "CD", codeDevise: "CDF", denomination: "Franc Congolais" },
  { id: "d4", codePays: "UG", codeDevise: "UGX", denomination: "Shilling Ougandais" },
  { id: "d5", codePays: "KE", codeDevise: "KES", denomination: "Shilling Kenyan" },
];

// ============== Entrepôts ==============
export interface Entrepot {
  id: string;
  code: string;
  nom: string;
  bureau: string;
  capacite: number;
}
export const ENTREPOTS: Entrepot[] = [];

// ============== Articles dossier ==============
export interface Article {
  id: string;
  designation: string;
  position: string;
  quantite: number;
  poids: number;
  fob: number;
}

// ============== Colisage (Agent pointage) ==============
export interface Colisage {
  id: string;
  dossierId: string;
  reference: string;
  date: string;
  nombreColis: number;
  poidsTotal: number;
  description: string;
  agentId: string;
  status: "soumis" | "validé" | "rejeté";
}

export const COLISAGES: Colisage[] = [];

// ============== Entités (Chef Manifest) ==============
export interface Entite {
  id: string;
  code: string;
  denomination: string;
  agentsPercepteurs: string[];
}

export const ENTITES: Entite[] = [];

// ============== Membres (Chef Manifest) ==============
export interface Membre {
  id: string;
  nom: string;
  postNom: string;
  prenom: string;
  telephone: string;
  agence: string;
  cotisationPayee: boolean;
  montantCotisation: number;
}

export const MEMBRES: Membre[] = [];

// ============== Bâtiments d'entrepôt (Chef Entrepôt Log) ==============
export interface Batiment {
  id: string;
  nom: string;
  entrepotId: string;
  espaces: EspaceStockage[];
}

export interface EspaceStockage {
  id: string;
  nom: string;
  capacite: number;
  occupe: number;
  status: "libre" | "partiel" | "plein";
}

export const BATIMENTS: Batiment[] = [];

// ============== Dossiers traités (Vérificateur) ==============
export interface DossierTraite {
  id: string;
  dossierId: string;
  reference: string;
  importateur: string;
  type: DossierType;
  dateTraitement: string;
  agent: string;
  resultat: "conforme" | "non_conforme" | "en_attente";
}

export const DOSSIERS_TRAITES: DossierTraite[] = [];

// ============== Types de dossiers (SuperAdmin) ==============
export interface TypeDossier {
  id: string;
  code: string;
  libelle: string;
  tarif: number;
  devise: string;
  actif: boolean;
  dateCreation: string;
}

export const TYPES_DOSSIERS: TypeDossier[] = [
  {
    id: "td1",
    code: "DIRECT",
    libelle: "Direct",
    tarif: 50,
    devise: "USD",
    actif: true,
    dateCreation: "2025-01-10",
  },
  {
    id: "td2",
    code: "TRANSB",
    libelle: "Transbordement",
    tarif: 50,
    devise: "USD",
    actif: true,
    dateCreation: "2025-01-10",
  },
  {
    id: "td3",
    code: "VRAC",
    libelle: "Véhicule (Vrac)",
    tarif: 10,
    devise: "USD",
    actif: true,
    dateCreation: "2025-01-10",
  },
  {
    id: "td4",
    code: "LOT",
    libelle: "Lot",
    tarif: 10,
    devise: "USD",
    actif: true,
    dateCreation: "2025-01-10",
  },
  {
    id: "td5",
    code: "COLIS",
    libelle: "Colis",
    tarif: 10,
    devise: "USD",
    actif: true,
    dateCreation: "2025-01-10",
  },
  {
    id: "td6",
    code: "DECH",
    libelle: "Déchargement",
    tarif: 10,
    devise: "USD",
    actif: true,
    dateCreation: "2025-02-15",
  },
  {
    id: "td7",
    code: "CHARG",
    libelle: "Chargement",
    tarif: 10,
    devise: "USD",
    actif: true,
    dateCreation: "2025-02-15",
  },
  {
    id: "td8",
    code: "PETROL",
    libelle: "Produit pétrolier",
    tarif: 50,
    devise: "USD",
    actif: true,
    dateCreation: "2025-03-01",
  },
  {
    id: "td9",
    code: "AUTRE",
    libelle: "Autres",
    tarif: 10,
    devise: "USD",
    actif: false,
    dateCreation: "2025-04-20",
  },
];

// ============== Partenaires terrain (modèle avancé) ==============
export interface PartenaireCommission {
  typeDossierId: string;
  typeCommission: "fixe" | "pourcentage";
  valeurCommission: number;
}

export interface PartenaireBureau {
  bureauId: string;
  commissions: PartenaireCommission[];
}

export interface Partenaire {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  email?: string;
  password?: string;
  bureaux: PartenaireBureau[];
  status: "actif" | "suspendu";
  dateCreation: string;
}

export const PARTENAIRES: Partenaire[] = [];

// ============== Transactions partenaires (historique) ==============
export interface PartenaireTransaction {
  id: string;
  partenaireId: string;
  dossierId: string;
  dossierRef: string;
  bureauId: string;
  typeDossierId: string;
  prixGlobal: number;
  partPartenaire: number;
  partSysteme: number;
  date: string;
}

export const PARTENAIRE_TRANSACTIONS: PartenaireTransaction[] = [];

export function calcPartenaireStats(partenaireId: string) {
  const txs = PARTENAIRE_TRANSACTIONS.filter((t) => t.partenaireId === partenaireId);
  const solde = txs.reduce((s, t) => s + t.partPartenaire, 0);
  const dossiersTraites = txs.length;
  const commissionMoyenne = dossiersTraites > 0 ? solde / dossiersTraites : 0;
  const dernierDossier = txs.length > 0 ? txs[txs.length - 1].date : "—";
  return {
    solde: Math.round(solde * 100) / 100,
    dossiersTraites,
    commissionMoyenne: Math.round(commissionMoyenne * 100) / 100,
    dernierDossier,
  };
}

// ============== Conversations Chat (WhatsApp-style) ==============
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

export const CONVERSATIONS: ChatConversation[] = [];

// ============== Sorties spéciales ==============
export interface SortieSpeciale {
  id: string;
  reference: string;
  dossierId: string;
  motif: string;
  vehicule: string;
  date: string;
  autorisePar: string;
  status: "autorisé" | "en_attente" | "refusé";
}

export const SORTIES_SPECIALES: SortieSpeciale[] = [];

// ============== Activités récentes (timeline) ==============
export interface ActiviteRecente {
  id: string;
  action: string;
  reference: string;
  user: string;
  date: string;
  heure: string;
  type: "creation" | "paiement" | "verification" | "apurement" | "alerte" | "entree" | "sortie";
}

export const ACTIVITES_RECENTES: ActiviteRecente[] = [];

// ============== Solde virtuel ==============
export interface SoldeVirtuel {
  totalEncaisse: number;
  totalCommissions: number;
  soldeNet: number;
  devise: string;
  derniereMaj: string;
  mouvements: {
    id: string;
    type: "credit" | "debit";
    montant: number;
    libelle: string;
    date: string;
    ref: string;
  }[];
}

export const SOLDE_VIRTUEL: SoldeVirtuel = {
  totalEncaisse: 0,
  totalCommissions: 0,
  soldeNet: 0,
  devise: "USD",
  derniereMaj: new Date().toISOString(),
  mouvements: [],
};

// ============== Secrétaires de l'inspecteur ==============
export interface SecretaireInsp {
  id: string;
  nom: string;
  postNom: string;
  prenom: string;
  matricule: string;
  fonction: string;
  identifiant: string;
  motDePasse: string;
  inspecteurId: string;
  status: "actif" | "désactivé";
  dateCreation: string;
  dossiersAssignes: number;
  dossiersTraites: number;
}

export const SECRETAIRES_INSPECTEUR: SecretaireInsp[] = [];

// ============== Assignation dossiers aux secrétaires ==============
export interface DossierAssignment {
  id: string;
  dossierId: string;
  dossierRef: string;
  secretaireId: string;
  dateAssignment: string;
  status: "assigné" | "vérifié" | "apuré" | "rejeté";
  importateur: string;
  type: DossierType;
}

export const DOSSIER_ASSIGNMENTS: DossierAssignment[] = [];

export interface ChefBarriereCommission {
  typeDossierId: string;
  typeCommission: "fixe" | "pourcentage";
  valeurCommission: number;
}

export interface ChefBarriereOuganda {
  id: string;
  nom: "Chef Barrière Ouganda";
  commissions: ChefBarriereCommission[];
  statut: "actif" | "inactif";
  dateCreation: string;
  observation?: string;
}

export const CHEF_BARRIERE_OUGANDA: ChefBarriereOuganda = {
  id: "cbo1",
  nom: "Chef Barrière Ouganda",
  commissions: [],
  statut: "actif",
  dateCreation: new Date().toISOString(),
};

export interface DossierShareAllocation {
  id: string;
  dossierId: string;
  dossierRef: string;
  dossierType: DossierType;
  montantDossier: number;
  pourcentageCommission: number;
  montantCommission: number;
  statut: "en attente" | "contrôlé" | "payé";
  dateAttribution: string;
  observation?: string;
}

export const DOSSIER_SHARE_ALLOCATIONS: DossierShareAllocation[] = [];

export interface EmptyManifestBatchBilling {
  id: string;
  batchNumber: string;
  nombreManifests: number;
  montantTotal: number;
  montantParUnit: number;
  statut: "à facturer" | "facturé" | "payé";
  dateCreation: string;
  dateFacturation?: string;
  datePaiement?: string;
  manifests: string[];
  responsable: "Super Admin";
  observation?: string;
}

export const EMPTY_MANIFEST_BATCH_BILLINGS: EmptyManifestBatchBilling[] = [];

// ============== Soumissions d'apurement (par secrétaires) ==============
export interface ApurementSubmission {
  id: string;
  dossierId: string;
  dossierRef: string;
  secretaireId: string;
  secretaireNom: string;
  refDouane: string;
  dateApurement: string;
  dateSoumission: string;
  status: "soumis" | "validé" | "rejeté";
  importateur: string;
  type: DossierType;
}

export const APUREMENT_SUBMISSIONS: ApurementSubmission[] = [];
