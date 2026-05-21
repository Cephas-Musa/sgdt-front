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

export const DOSSIERS: Dossier[] = Array.from({ length: 64 }).map((_, i) => {
  const type = rand(types);
  const status = rand(statuses);
  const importateur = rand(importateurs);

  return {
    id: `D-${pad(i + 1)}`,
    type: i === 7 ? "lot" : type,
    reference: `RD-${pad(i + 1)}`,
    referenceDouane: `E-${pad(i + 1, 3)}`,
    importateur,
    exportateur: type === "export" ? "Congo Trading SARL" : undefined,
    declarant: `Agence ${rand(["Transit", "Rapid", "Customs", "Expert"])}`,
    nif: `NIF-${pad(i * 321, 8)}`,
    dra: `E-${pad(i + 5, 3)}`,
    t1: `T1-${pad(i + 10, 5)}`,
    vehicule: `Camion ${rand(["Volvo", "Mercedes", "Scania", "Iveco"])}`,
    plaque: `${rand(["CGO", "OUG", "K"])} ${pad(i * 123, 4)}`,
    pays: rand(pays),
    provenance: rand(pays),
    destination: rand(pays),
    date: `2026-05-${pad((i % 30) + 1, 2)}`,
    status,
    quantite: (i % 50) + 10,
    poids: (i % 1000) + 500,
    colis: (i % 20) + 5,
    typeMarchandises: rand(["Sucre", "Farine", "Ciment", "Produits pétroliers", "Divers"]),
    localisation: rand(["Kasindi Port", "Entrepôt A", "Zone Neutre"]),
    province: "NORD-KIVU",
    bureauRepr: rand(reprBureaux),
    devise: rand(devises),
    nombreDeclarations: (i % 3) + 1,
    nbTitres: (i % 5) + 1,
    nbDeclarations: (i % 3) + 1,
    modeDeclaration: rand(modesDeclaration),
    barriereEtranger: {
      entree: "OUI",
      traversee: "VALIDÉ",
      validation: "OK",
      transport: "CONFORME",
    },
    barrierePays: {
      entree: "ARRIVÉ",
      posteDouanier: "KASINDI",
      validation: "EN ATTENTE",
      mouvementsInternes: "AUCUN",
    },
    donneesRepresentation: {
      bureau: rand(reprBureaux),
      importateur,
      referenceDra: `DRA-${pad(i, 5)}`,
      referenceT1: `T1-${pad(i, 5)}`,
      typeDossier: type,
    },
    rapportColisage: {
      colis: (i % 20) + 5,
      denombrement: "VÉRIFIÉ",
      pointage: "FAIT",
      quantites: "CONFORMES",
    },
    verificationRapport: {
      resultat: "CONFORME",
      observations: "Aucune",
      anomalies: "Néant",
      commentaires: "Dossier en règle",
    },
    sortie: {
      autorisation: "OUI",
      bonSortie: `BS-${pad(i, 4)}`,
      dateSortie: "2026-05-15",
      destinationFinale: "Goma",
    },
    rapportDechargement: {
      entrepot: "ENTREPÔT KASINDI 1",
      dechargement: "TERMINÉ",
      emplacement: "QUAI 4",
      statutFinal: "APURÉ",
    },
    operateurSaisie: rand(["Jean M.", "Marie K.", "Paul T.", "Lucie B."]),
    articles: Array.from({ length: (i % 4) + 1 }).map((_, j) => ({
      id: `ART-${i}-${j}`,
      designation: rand([
        "Farine de Froment",
        "Sucre Roux",
        "Huile Végétale",
        "Ciment Gris",
        "Pneus",
      ]),
      position: `760${j}00`,
      quantite: (j + 1) * 10,
      poids: (j + 1) * 100,
      fob: (j + 1) * 500,
    })),
    trafic:
      type === "trafic"
        ? {
            moyenTransport: rand(["velo", "tricycle", "voiture", "humain"]),
            lieuEntreposage: "Plein air",
            entrepot: "Entrepôt Kasindi 1",
            evaluateurs: ["Inspecteur K.", "Agent M."],
          }
        : undefined,
    export:
      type === "export"
        ? {
            exportateur: "Congo Trading SARL",
            modeDeclaration: rand(modesDeclaration),
            docsJoints: [
              { designation: "Facture", reference: `INV-${pad(i)}`, date: "2026-05-01" },
              { designation: "Certificat", reference: `CERT-${pad(i)}`, date: "2026-05-02" },
            ],
          }
        : undefined,
    createdAt: i < 5 ? new Date().toISOString() : `2026-05-${pad((i % 30) + 1, 2)}T10:00:00Z`,
  };
});

export const IT_ENTRIES: ITEntry[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `IT-${pad(i + 1, 3)}`,
  reference: `IT/2026/${pad(100 + i)}`,
  chassis: `CHAS-${pad(i * 1234, 6)}`,
  consignee: rand(importateurs),
  vehicleMark: rand(["Toyota", "Mercedes", "Volvo", "Scania"]),
  manifestYear: 2025 + (i % 2),
  color: rand(["Blanc", "Bleu", "Gris", "Noir", "Rouge"]),
  date: `2026-05-${pad((i % 30) + 1, 2)}`,
}));

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

export const ACCOUNTS: Account[] = [
  {
    id: "u1",
    username: "k.muteba",
    fullName: "K. Muteba",
    role: "operateur_saisie",
    phone: "+243 99 100 1001",
    status: "actif",
    matricule: "MAT-001",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Chef Bureau Repr",
    dateCreation: "2025-09-15",
  },
  {
    id: "u2",
    username: "j.kasongo",
    fullName: "J. Kasongo",
    role: "verificateur",
    phone: "+243 99 100 1002",
    status: "actif",
    matricule: "MAT-002",
    bureau: "GOMA VILLE",
    province: "NORD-KIVU",
    creePar: "CB Vérification",
    dateCreation: "2025-09-10",
  },
  {
    id: "u3",
    username: "p.tshibanda",
    fullName: "P. Tshibanda",
    role: "brigadier_barriere",
    phone: "+243 99 100 1003",
    status: "actif",
    matricule: "MAT-003",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Chef Barrière Ouganda",
    dateCreation: "2025-08-20",
  },
  {
    id: "u4",
    username: "n.mwamba",
    fullName: "N. Mwamba",
    role: "secretaire_inspecteur",
    phone: "+243 99 100 1004",
    status: "désactivé",
    matricule: "MAT-004",
    bureau: "GOMA VILLE",
    province: "NORD-KIVU",
    creePar: "Inspecteur Chef",
    dateCreation: "2025-07-05",
  },
  {
    id: "u5",
    username: "a.kabongo",
    fullName: "A. Kabongo",
    role: "inspecteur_chef",
    phone: "+243 99 100 1005",
    status: "actif",
    matricule: "MAT-005",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Dir. Provincial",
    dateCreation: "2025-06-01",
  },
  {
    id: "u6",
    username: "m.bahati",
    fullName: "M. Bahati",
    role: "directeur_provincial",
    phone: "+243 99 100 1006",
    status: "actif",
    matricule: "MAT-006",
    province: "ITURI",
    creePar: "Dir. Général",
    dateCreation: "2025-05-01",
  },
  {
    id: "u7",
    username: "s.lokale",
    fullName: "S. Lokale",
    role: "chef_manifest",
    phone: "+243 99 100 1007",
    status: "actif",
    matricule: "MAT-007",
    bureau: "GOMA VILLE",
    province: "NORD-KIVU",
    creePar: "Inspecteur Chef",
    dateCreation: "2025-09-01",
  },
  {
    id: "u8",
    username: "b.kivu",
    fullName: "B. Kivu",
    role: "percepteur",
    phone: "+243 99 100 1008",
    status: "actif",
    matricule: "MAT-008",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Chef Manifest",
    dateCreation: "2025-09-12",
  },
  {
    id: "u9",
    username: "c.goma",
    fullName: "C. Goma",
    role: "agent_pointage",
    phone: "+243 99 100 1009",
    status: "actif",
    matricule: "MAT-009",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Chef Entrepôt",
    dateCreation: "2025-08-15",
  },
  {
    id: "u10",
    username: "d.beni",
    fullName: "D. Beni",
    role: "chef_entrepot_douane",
    phone: "+243 99 100 1010",
    status: "actif",
    matricule: "MAT-010",
    bureau: "GOMA VILLE",
    province: "NORD-KIVU",
    creePar: "Inspecteur Chef",
    dateCreation: "2025-07-20",
  },
  {
    id: "u11",
    username: "e.butembo",
    fullName: "E. Butembo",
    role: "chef_entrepot_log",
    phone: "+243 99 100 1011",
    status: "actif",
    matricule: "MAT-011",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Inspecteur Chef",
    dateCreation: "2025-08-01",
  },
  {
    id: "u12",
    username: "f.uvira",
    fullName: "F. Uvira",
    role: "typing_operator",
    phone: "+243 99 100 1012",
    status: "actif",
    matricule: "MAT-012",
    bureau: "KASINDI",
    province: "NORD-KIVU",
    creePar: "Chef Barrière Ouganda",
    dateCreation: "2025-09-05",
  },
  {
    id: "u13",
    username: "m.lunda",
    fullName: "M. Lunda",
    role: "operateur_saisie",
    phone: "+243 99 100 1013",
    status: "actif",
    matricule: "MAT-013",
    bureau: "KASINDI",
    dateCreation: "2026-01-10",
  },
  {
    id: "u14",
    username: "j.ngoy",
    fullName: "J. Ngoy",
    role: "operateur_saisie",
    phone: "+243 99 100 1014",
    status: "désactivé",
    matricule: "MAT-014",
    bureau: "GOMA VILLE",
    dateCreation: "2026-02-15",
  },
  {
    id: "u15",
    username: "s.kabila",
    fullName: "S. Kabila",
    role: "operateur_saisie",
    phone: "+243 99 100 1015",
    status: "actif",
    matricule: "MAT-015",
    bureau: "KASINDI",
    dateCreation: "2026-03-20",
  },
];

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

export const ALERTS: AlertItem[] = [
  {
    id: "A1",
    title: "Incohérence poids/quantité — DSR/2025/1003",
    level: "urgent",
    type: "incoherence",
    date: "2025-10-28",
    codeBureau: "617B",
    nomBureau: "KASINDI",
  },
  {
    id: "A2",
    title: "Paiement manquant — DSR/2025/1011",
    level: "important",
    type: "paiement",
    date: "2025-10-27",
    codeBureau: "UGMPO",
    nomBureau: "MPONDWE",
  },
  {
    id: "A3",
    title: "Retard sortie barrière Bunagana",
    level: "important",
    type: "retard",
    date: "2025-10-27",
    codeBureau: "UGKLA",
    nomBureau: "KAMPALA",
  },
  {
    id: "A4",
    title: "Tentative de fraude détectée",
    level: "urgent",
    type: "fraude",
    date: "2025-10-26",
    codeBureau: "617B",
    nomBureau: "KASINDI",
  },
  {
    id: "A5",
    title: "Nouveau bureau ajouté",
    level: "info",
    type: "incoherence",
    date: "2025-10-25",
    codeBureau: "BRU",
    nomBureau: "BRUXELLES",
  },
  {
    id: "A6",
    title: "Alerte Sortie + Pays",
    level: "urgent",
    type: "incoherence",
    date: "Aujourd'hui",
    codeBureau: "UGMPO",
    nomBureau: "MPONDWE",
  },
  {
    id: "A7",
    title: "Alerte Entrée sur Territoire National",
    level: "important",
    type: "incoherence",
    date: "Aujourd'hui",
    codeBureau: "617B",
    nomBureau: "KASINDI",
  },
  {
    id: "A8",
    title: "Dossier Apuré",
    level: "info",
    type: "incoherence",
    date: "Hier",
    codeBureau: "603B",
    nomBureau: "GOMA VILLE",
  },
];

// ============== Chat ==============
export interface ChatThread {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  group: boolean;
}

export const CHATS: ChatThread[] = [
  { id: "c1", name: "Bureau Goma — Général", lastMessage: "Réunion 14h", unread: 2, group: true },
  {
    id: "c2",
    name: "Inspecteur Mwangi",
    lastMessage: "OK pour le rapport",
    unread: 0,
    group: false,
  },
  {
    id: "c3",
    name: "Barrière Bunagana",
    lastMessage: "Véhicule en attente",
    unread: 5,
    group: true,
  },
  {
    id: "c4",
    name: "Cellule Vérification",
    lastMessage: "DSR/2025/1014 vérifié",
    unread: 0,
    group: true,
  },
];

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

export const BARRIERE_ENTRIES: BarriereEntry[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `B${pad(i + 1, 3)}`,
  reference: `BAR/${pad(500 + i)}`,
  vehicule: `${["AA", "BC", "CC"][i % 3]} ${pad(2000 + i)} XY`,
  charge: i % 3 === 0 ? "vide" : "chargé",
  type: i % 5 === 0 ? "vrac" : "véhicule",
  sens: i % 2 === 0 ? "entrée" : "sortie",
  date: `2025-10-${pad(10 + (i % 18), 2)}`,
}));

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

export const EMPTY_MANIFESTS: EmptyManifest[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `EM${pad(i + 1, 3)}`,
  reference: `EMP/2025/${pad(700 + i)}`,
  declarant: ["Atlas SARL", "Imex Trading", "Global Cargo"][i % 3],
  vehicule: `${["AA", "AB", "BC"][i % 3]} ${pad(3000 + i)} ZA`,
  marque: ["Toyota", "Mitsubishi", "Isuzu", "MAN"][i % 4],
  destination: ["Goma", "Beni", "Butembo", "Kasindi"][i % 4],
  receveur: ["Kivu Import", "Sahel Logistics", "Atlas SARL"][i % 3],
  barriereEntree: ["Mpondwe", "Chanika"][i % 2],
  barriereSortie: ["Kasindi", "Goma ville"][i % 2],
  status: (["payé", "barrière 1", "barrière 2", "cachet", "sortie Ouganda"] as const)[i % 5],
  date: `2025-10-${pad(5 + (i % 22), 2)}`,
  montant: 25,
  typeVehicule: ["Camion", "Pick-up", "Semi-remorque", "Bus"][i % 4],
  transporteur: ["Trans-Kivu", "Express Cargo", "Sahel Transport"][i % 3],
  lieuChargement: ["Kampala", "Nairobi", "Dar es Salaam"][i % 3],
  proprietaire: ["Atlas SARL", "Kivu Import", "PetroPlus SA"][i % 3],
  nomChauffeur: ["Jean Mulumba", "Pierre Kabongo", "Marie Ngoy", "Paul Kasongo"][i % 4],
}));

// ============== Bureaux douaniers (créés par le DG) ==============
export interface BureauDouanier {
  id: string;
  code: string;
  denomination: string;
  icb?: string;
  province?: string;
  manifestPrice: number;
}

export const BUREAUX_DOUANIERS: BureauDouanier[] = [
  {
    id: "bd1",
    code: "617B",
    denomination: "KASINDI",
    icb: "ICB Nord-Kivu",
    province: "NORD-KIVU",
    manifestPrice: 25,
  },
  {
    id: "bd2",
    code: "603B",
    denomination: "GOMA VILLE",
    icb: "ICB Nord-Kivu",
    province: "NORD-KIVU",
    manifestPrice: 20,
  },
  {
    id: "bd3",
    code: "BD-021",
    denomination: "BUKAVU",
    icb: "ICB Sud-Kivu",
    province: "SUD-KIVU",
    manifestPrice: 15,
  },
  { id: "bd4", code: "BD-105", denomination: "KISANGANI", province: "TSHOPO", manifestPrice: 10 },
  { id: "bd5", code: "BD-201", denomination: "BUNIA", province: "ITURI", manifestPrice: 30 },
  { id: "bd6", code: "BD-202", denomination: "MAHAGI", province: "ITURI", manifestPrice: 25 },
];

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

export const DIRECTIONS_PROVINCIALES: DirectionProvinciale[] = [
  {
    id: "dp1",
    numero: 1,
    denomination: "NORD-KIVU",
    nombreBureaux: 4,
    directeur: "M. Kabongo",
    telephone: "+243 99 200 1001",
    email: "kabongo@douanes.cd",
    dateCreation: "2024-01-15",
  },
  {
    id: "dp2",
    numero: 2,
    denomination: "SUD-KIVU",
    nombreBureaux: 3,
    directeur: "Mme. Mwamba",
    telephone: "+243 99 200 1002",
    email: "mwamba@douanes.cd",
    dateCreation: "2024-01-15",
  },
  {
    id: "dp3",
    numero: 3,
    denomination: "TSHOPO",
    nombreBureaux: 2,
    directeur: "M. Lokale",
    telephone: "+243 99 200 1003",
    email: "lokale@douanes.cd",
    dateCreation: "2024-03-01",
  },
  {
    id: "dp4",
    numero: 4,
    denomination: "ITURI",
    nombreBureaux: 2,
    directeur: "M. Bahati",
    telephone: "+243 99 200 1004",
    email: "bahati@douanes.cd",
    dateCreation: "2024-06-01",
  },
];

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

export const BUREAUX_REPR: BureauRepresentation[] = [
  {
    id: "br1",
    code: "UGMPO",
    denomination: "MPONDWE",
    type: "sortie",
    ville: "Mpondwe",
    pays: "OUGANDA",
    status: "actif",
  },
  {
    id: "br2",
    code: "UGCYKA",
    denomination: "CHANIKA",
    type: "sortie",
    ville: "Chanika",
    pays: "OUGANDA",
    status: "actif",
  },
  {
    id: "br3",
    code: "617B",
    denomination: "KASINDI",
    type: "entree",
    ville: "Kasindi",
    pays: "RDC",
    status: "actif",
  },
  {
    id: "br4",
    code: "603B",
    denomination: "GOMA VILLE",
    type: "entree",
    ville: "Goma",
    pays: "RDC",
    status: "actif",
  },
  {
    id: "br5",
    code: "UGKLA",
    denomination: "KAMPALA",
    type: "sortie",
    ville: "Kampala",
    pays: "OUGANDA",
    status: "actif",
  },
  {
    id: "br6",
    code: "BRU",
    denomination: "BRUXELLES",
    type: "sortie",
    ville: "Bruxelles",
    pays: "BELGIQUE",
    status: "actif",
  },
];

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
export const ENTREPOTS: Entrepot[] = [
  { id: "e1", code: "ENT-01", nom: "Entrepôt Kasindi 1", bureau: "KASINDI", capacite: 200 },
  { id: "e2", code: "ENT-02", nom: "Entrepôt Kasindi 2", bureau: "KASINDI", capacite: 150 },
  { id: "e3", code: "ENT-03", nom: "Entrepôt Goma", bureau: "GOMA VILLE", capacite: 300 },
];


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

export const COLISAGES: Colisage[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `COL-${pad(i + 1, 3)}`,
  dossierId: `D-${pad((i % 10) + 1)}`,
  reference: `COL/2025/${pad(100 + i)}`,
  date: `2025-10-${pad(5 + (i % 22), 2)}`,
  nombreColis: Math.floor(Math.random() * 50) + 1,
  poidsTotal: Math.floor(Math.random() * 5000) + 100,
  description: [
    "Marchandises diverses",
    "Matériaux construction",
    "Produits alimentaires",
    "Équipements électroniques",
    "Pièces automobiles",
  ][i % 5],
  agentId: "u9",
  status: (["soumis", "validé", "rejeté"] as const)[i % 3],
}));

// ============== Entités (Chef Manifest) ==============
export interface Entite {
  id: string;
  code: string;
  denomination: string;
  agentsPercepteurs: string[];
}

export const ENTITES: Entite[] = [
  {
    id: "ent1",
    code: "ENT-NK-01",
    denomination: "Entité Nord-Kivu Kasindi",
    agentsPercepteurs: ["u8"],
  },
  { id: "ent2", code: "ENT-NK-02", denomination: "Entité Nord-Kivu Goma", agentsPercepteurs: [] },
  { id: "ent3", code: "ENT-SK-01", denomination: "Entité Sud-Kivu Bukavu", agentsPercepteurs: [] },
];

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

export const MEMBRES: Membre[] = [
  {
    id: "mb1",
    nom: "Mulumba",
    postNom: "Kabongo",
    prenom: "Jean",
    telephone: "+243 99 300 1001",
    agence: "Agence Kivu Douane",
    cotisationPayee: true,
    montantCotisation: 100,
  },
  {
    id: "mb2",
    nom: "Ngoy",
    postNom: "Mwangi",
    prenom: "Pierre",
    telephone: "+243 99 300 1002",
    agence: "Agence Atlas",
    cotisationPayee: false,
    montantCotisation: 100,
  },
  {
    id: "mb3",
    nom: "Kasongo",
    postNom: "Bahati",
    prenom: "Marie",
    telephone: "+243 99 300 1003",
    agence: "Agence Global Cargo",
    cotisationPayee: true,
    montantCotisation: 100,
  },
];

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

export const BATIMENTS: Batiment[] = [
  {
    id: "bat1",
    nom: "Bâtiment 1",
    entrepotId: "e1",
    espaces: [
      { id: "esp1-1", nom: "Espace A", capacite: 50, occupe: 30, status: "partiel" },
      { id: "esp1-2", nom: "Espace B", capacite: 50, occupe: 50, status: "plein" },
      { id: "esp1-3", nom: "Espace C", capacite: 50, occupe: 0, status: "libre" },
    ],
  },
  {
    id: "bat2",
    nom: "Bâtiment 2",
    entrepotId: "e1",
    espaces: [
      { id: "esp2-1", nom: "Espace A", capacite: 40, occupe: 20, status: "partiel" },
      { id: "esp2-2", nom: "Espace B", capacite: 40, occupe: 0, status: "libre" },
    ],
  },
  {
    id: "bat3",
    nom: "Bâtiment 3",
    entrepotId: "e3",
    espaces: [
      { id: "esp3-1", nom: "Espace A", capacite: 100, occupe: 75, status: "partiel" },
      { id: "esp3-2", nom: "Espace B", capacite: 100, occupe: 100, status: "plein" },
      { id: "esp3-3", nom: "Espace C", capacite: 100, occupe: 10, status: "partiel" },
    ],
  },
];

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

export const DOSSIERS_TRAITES: DossierTraite[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `DT-${pad(i + 1, 3)}`,
  dossierId: `D-${pad(i + 1)}`,
  reference: `DSR/2025/${pad(1000 + i)}`,
  importateur: rand(importateurs),
  type: rand(types),
  dateTraitement: `2025-10-${pad(1 + (i % 28), 2)}`,
  agent: ["J. Kasongo", "K. Muteba", "P. Tshibanda"][i % 3],
  resultat: (["conforme", "non_conforme", "en_attente"] as const)[i % 3],
}));

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

export const PARTENAIRES: Partenaire[] = [
  {
    id: "p1",
    nom: "SOCOTRANS SARL",
    contact: "M. Kalume",
    telephone: "+243 99 123 4567",
    email: "kalume@socotrans.cd",
    bureaux: [
      {
        bureauId: "bd1",
        commissions: [
          { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 30 },
          { typeDossierId: "td2", typeCommission: "fixe", valeurCommission: 20 },
          { typeDossierId: "td8", typeCommission: "pourcentage", valeurCommission: 25 },
        ],
      },
      {
        bureauId: "bd2",
        commissions: [
          { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 25 },
          { typeDossierId: "td3", typeCommission: "fixe", valeurCommission: 3 },
        ],
      },
    ],
    status: "actif",
    dateCreation: "2025-01-15",
  },
  {
    id: "p2",
    nom: "AFRILOG Services",
    contact: "J. Mwamba",
    telephone: "+243 81 222 3344",
    email: "mwamba@afrilog.cd",
    bureaux: [
      {
        bureauId: "bd2",
        commissions: [
          { typeDossierId: "td1", typeCommission: "fixe", valeurCommission: 15 },
          { typeDossierId: "td2", typeCommission: "pourcentage", valeurCommission: 35 },
          { typeDossierId: "td4", typeCommission: "fixe", valeurCommission: 4 },
        ],
      },
    ],
    status: "actif",
    dateCreation: "2025-02-10",
  },
  {
    id: "p3",
    nom: "KIVU Import Export",
    contact: "P. Kabongo",
    telephone: "+243 97 555 6677",
    bureaux: [
      {
        bureauId: "bd1",
        commissions: [
          { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 20 },
          { typeDossierId: "td5", typeCommission: "fixe", valeurCommission: 3 },
        ],
      },
      {
        bureauId: "bd3",
        commissions: [
          { typeDossierId: "td2", typeCommission: "pourcentage", valeurCommission: 28 },
        ],
      },
    ],
    status: "actif",
    dateCreation: "2025-03-05",
  },
  {
    id: "p4",
    nom: "Congo Cargo Ltd",
    contact: "D. Tshibangu",
    telephone: "+243 82 888 9900",
    email: "tshibangu@congocargo.cd",
    bureaux: [
      {
        bureauId: "bd2",
        commissions: [{ typeDossierId: "td1", typeCommission: "fixe", valeurCommission: 10 }],
      },
    ],
    status: "suspendu",
    dateCreation: "2025-04-20",
  },
  {
    id: "p5",
    nom: "Great Lakes Trading",
    contact: "A. Mukendi",
    telephone: "+256 70 111 2233",
    email: "mukendi@greatlakes.ug",
    bureaux: [
      {
        bureauId: "bd1",
        commissions: [
          { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 30 },
          { typeDossierId: "td2", typeCommission: "pourcentage", valeurCommission: 30 },
          { typeDossierId: "td3", typeCommission: "fixe", valeurCommission: 4 },
          { typeDossierId: "td8", typeCommission: "pourcentage", valeurCommission: 20 },
        ],
      },
      {
        bureauId: "bd2",
        commissions: [
          { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 25 },
          { typeDossierId: "td4", typeCommission: "fixe", valeurCommission: 3 },
        ],
      },
      {
        bureauId: "bd5",
        commissions: [{ typeDossierId: "td1", typeCommission: "fixe", valeurCommission: 12 }],
      },
    ],
    status: "actif",
    dateCreation: "2025-01-08",
  },
];

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

export const PARTENAIRE_TRANSACTIONS: PartenaireTransaction[] = [
  {
    id: "pt1",
    partenaireId: "p1",
    dossierId: "D-0001",
    dossierRef: "DSR/2025/1000",
    bureauId: "bd1",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-01",
  },
  {
    id: "pt2",
    partenaireId: "p1",
    dossierId: "D-0003",
    dossierRef: "DSR/2025/1002",
    bureauId: "bd1",
    typeDossierId: "td2",
    prixGlobal: 50,
    partPartenaire: 20,
    partSysteme: 30,
    date: "2025-10-03",
  },
  {
    id: "pt3",
    partenaireId: "p1",
    dossierId: "D-0005",
    dossierRef: "DSR/2025/1004",
    bureauId: "bd2",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 12.5,
    partSysteme: 37.5,
    date: "2025-10-05",
  },
  {
    id: "pt4",
    partenaireId: "p1",
    dossierId: "D-0010",
    dossierRef: "DSR/2025/1009",
    bureauId: "bd1",
    typeDossierId: "td8",
    prixGlobal: 50,
    partPartenaire: 12.5,
    partSysteme: 37.5,
    date: "2025-10-10",
  },
  {
    id: "pt5",
    partenaireId: "p2",
    dossierId: "D-0002",
    dossierRef: "DSR/2025/1001",
    bureauId: "bd2",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-02",
  },
  {
    id: "pt6",
    partenaireId: "p2",
    dossierId: "D-0004",
    dossierRef: "DSR/2025/1003",
    bureauId: "bd2",
    typeDossierId: "td2",
    prixGlobal: 50,
    partPartenaire: 17.5,
    partSysteme: 32.5,
    date: "2025-10-04",
  },
  {
    id: "pt7",
    partenaireId: "p2",
    dossierId: "D-0008",
    dossierRef: "DSR/2025/1007",
    bureauId: "bd2",
    typeDossierId: "td4",
    prixGlobal: 10,
    partPartenaire: 4,
    partSysteme: 6,
    date: "2025-10-08",
  },
  {
    id: "pt8",
    partenaireId: "p3",
    dossierId: "D-0006",
    dossierRef: "DSR/2025/1005",
    bureauId: "bd1",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 10,
    partSysteme: 40,
    date: "2025-10-06",
  },
  {
    id: "pt9",
    partenaireId: "p3",
    dossierId: "D-0009",
    dossierRef: "DSR/2025/1008",
    bureauId: "bd3",
    typeDossierId: "td2",
    prixGlobal: 50,
    partPartenaire: 14,
    partSysteme: 36,
    date: "2025-10-09",
  },
  {
    id: "pt10",
    partenaireId: "p5",
    dossierId: "D-0007",
    dossierRef: "DSR/2025/1006",
    bureauId: "bd1",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-07",
  },
  {
    id: "pt11",
    partenaireId: "p5",
    dossierId: "D-0011",
    dossierRef: "DSR/2025/1010",
    bureauId: "bd1",
    typeDossierId: "td2",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-11",
  },
  {
    id: "pt12",
    partenaireId: "p5",
    dossierId: "D-0012",
    dossierRef: "DSR/2025/1011",
    bureauId: "bd2",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 12.5,
    partSysteme: 37.5,
    date: "2025-10-12",
  },
  {
    id: "pt13",
    partenaireId: "p5",
    dossierId: "D-0015",
    dossierRef: "DSR/2025/1014",
    bureauId: "bd1",
    typeDossierId: "td8",
    prixGlobal: 50,
    partPartenaire: 10,
    partSysteme: 40,
    date: "2025-10-15",
  },
  {
    id: "pt14",
    partenaireId: "p5",
    dossierId: "D-0018",
    dossierRef: "DSR/2025/1017",
    bureauId: "bd5",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 12,
    partSysteme: 38,
    date: "2025-10-18",
  },
  {
    id: "pt15",
    partenaireId: "p5",
    dossierId: "D-0020",
    dossierRef: "DSR/2025/1019",
    bureauId: "bd1",
    typeDossierId: "td3",
    prixGlobal: 10,
    partPartenaire: 4,
    partSysteme: 6,
    date: "2025-10-20",
  },
  {
    id: "pt16",
    partenaireId: "p1",
    dossierId: "D-0022",
    dossierRef: "DSR/2025/1021",
    bureauId: "bd1",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-22",
  },
  {
    id: "pt17",
    partenaireId: "p1",
    dossierId: "D-0025",
    dossierRef: "DSR/2025/1024",
    bureauId: "bd2",
    typeDossierId: "td3",
    prixGlobal: 10,
    partPartenaire: 3,
    partSysteme: 7,
    date: "2025-10-25",
  },
  {
    id: "pt18",
    partenaireId: "p2",
    dossierId: "D-0028",
    dossierRef: "DSR/2025/1027",
    bureauId: "bd2",
    typeDossierId: "td1",
    prixGlobal: 50,
    partPartenaire: 15,
    partSysteme: 35,
    date: "2025-10-28",
  },

  // Extra data for richer history
  ...Array.from({ length: 30 }).map((_, i) => {
    const pIds = ["p1", "p1", "p2", "p5", "p5", "p3", "p1", "p5", "p2", "p5"];
    const pId = pIds[i % pIds.length];
    const bIds = ["bd1", "bd2", "bd1", "bd1", "bd2", "bd3", "bd1", "bd5", "bd2", "bd1"];
    const bId = bIds[i % bIds.length];
    const tIds = ["td1", "td2", "td1", "td3", "td4", "td2", "td8", "td1", "td1", "td2"];
    const tId = tIds[i % tIds.length];
    const td = TYPES_DOSSIERS.find((t) => t.id === tId);
    const prix = td?.tarif ?? 10;
    const part = Math.round((prix * (15 + (i % 20))) / 100);
    return {
      id: `pt${19 + i}`,
      partenaireId: pId,
      dossierId: `D-${String(30 + i).padStart(4, "0")}`,
      dossierRef: `DSR/2025/${1030 + i}`,
      bureauId: bId,
      typeDossierId: tId,
      prixGlobal: prix,
      partPartenaire: part,
      partSysteme: prix - part,
      date: `2025-${String(Math.floor(i / 28) + 9).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    };
  }),
];

// Helpers de calcul partenaire
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

export const CONVERSATIONS: ChatConversation[] = [
  {
    id: "c1",
    name: "Jean Kasongo",
    role: "Inspecteur Chef",
    avatar: "JK",
    lastMessage: "Le dossier DSR/2025/1005 est apuré",
    lastTime: "14:32",
    unread: 2,
    online: true,
    messages: [
      {
        id: "m1",
        senderId: "jk",
        senderName: "Jean Kasongo",
        text: "Bonjour, le dossier DSR/2025/1005 a été vérifié",
        time: "14:20",
        isMe: false,
      },
      {
        id: "m2",
        senderId: "me",
        senderName: "Moi",
        text: "Merci, quel est le résultat ?",
        time: "14:25",
        isMe: true,
      },
      {
        id: "m3",
        senderId: "jk",
        senderName: "Jean Kasongo",
        text: "Conforme. L'appurement est fait.",
        time: "14:30",
        isMe: false,
      },
      {
        id: "m4",
        senderId: "jk",
        senderName: "Jean Kasongo",
        text: "Le dossier DSR/2025/1005 est apuré",
        time: "14:32",
        isMe: false,
      },
    ],
  },
  {
    id: "c2",
    name: "Marie Kabila",
    role: "Directeur Provincial",
    avatar: "MK",
    lastMessage: "Les statistiques du mois sont prêtes",
    lastTime: "12:15",
    unread: 0,
    online: true,
    messages: [
      {
        id: "m5",
        senderId: "mk",
        senderName: "Marie Kabila",
        text: "Bonjour, comment allez-vous ?",
        time: "11:00",
        isMe: false,
      },
      {
        id: "m6",
        senderId: "me",
        senderName: "Moi",
        text: "Bien merci, et vous ?",
        time: "11:05",
        isMe: true,
      },
      {
        id: "m7",
        senderId: "mk",
        senderName: "Marie Kabila",
        text: "Les statistiques du mois sont prêtes",
        time: "12:15",
        isMe: false,
      },
    ],
  },
  {
    id: "c3",
    name: "Pierre Mutombo",
    role: "Chef Barrière Ouganda",
    avatar: "PM",
    lastMessage: "3 véhicules en attente à la barrière",
    lastTime: "Hier",
    unread: 1,
    online: false,
    messages: [
      {
        id: "m8",
        senderId: "pm",
        senderName: "Pierre Mutombo",
        text: "Alerte: 3 véhicules en attente à la barrière depuis 2h",
        time: "Hier 18:45",
        isMe: false,
      },
      {
        id: "m9",
        senderId: "me",
        senderName: "Moi",
        text: "Contactez le brigadier pour débloquer",
        time: "Hier 19:00",
        isMe: true,
      },
      {
        id: "m10",
        senderId: "pm",
        senderName: "Pierre Mutombo",
        text: "3 véhicules en attente à la barrière",
        time: "Hier 19:30",
        isMe: false,
      },
    ],
  },
  {
    id: "c4",
    name: "Sarah Lubaki",
    role: "Secrétaire Inspecteur",
    avatar: "SL",
    lastMessage: "Dossier lot payé et validé ✓",
    lastTime: "Hier",
    unread: 0,
    online: false,
    messages: [
      {
        id: "m11",
        senderId: "sl",
        senderName: "Sarah Lubaki",
        text: "Le lot RD-2025-34 nécessite validation",
        time: "Hier 10:00",
        isMe: false,
      },
      {
        id: "m12",
        senderId: "me",
        senderName: "Moi",
        text: "Validez si le paiement est confirmé",
        time: "Hier 10:30",
        isMe: true,
      },
      {
        id: "m13",
        senderId: "sl",
        senderName: "Sarah Lubaki",
        text: "Dossier lot payé et validé ✓",
        time: "Hier 11:00",
        isMe: false,
      },
    ],
  },
  {
    id: "c5",
    name: "David Tshisekedi",
    role: "Vérificateur",
    avatar: "DT",
    lastMessage: "Rapport mensuel envoyé par email",
    lastTime: "Lun",
    unread: 0,
    online: false,
    messages: [
      {
        id: "m14",
        senderId: "dt",
        senderName: "David Tshisekedi",
        text: "Rapport mensuel envoyé par email",
        time: "Lun 16:00",
        isMe: false,
      },
    ],
  },
];

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

export const SORTIES_SPECIALES: SortieSpeciale[] = [
  {
    id: "ss1",
    reference: "SS/2025/001",
    dossierId: "D-0003",
    motif: "Urgence médicale",
    vehicule: "AB 1002 XY",
    date: "2025-10-25",
    autorisePar: "Inspecteur Chef",
    status: "autorisé",
  },
  {
    id: "ss2",
    reference: "SS/2025/002",
    dossierId: "D-0007",
    motif: "Marchandise périssable",
    vehicule: "BC 1006 BB",
    date: "2025-10-26",
    autorisePar: "Inspecteur Chef",
    status: "autorisé",
  },
  {
    id: "ss3",
    reference: "SS/2025/003",
    dossierId: "D-0012",
    motif: "Transfert entrepôt",
    vehicule: "CC 1011 ZA",
    date: "2025-10-27",
    autorisePar: "—",
    status: "en_attente",
  },
  {
    id: "ss4",
    reference: "SS/2025/004",
    dossierId: "D-0015",
    motif: "Demande consulat",
    vehicule: "AA 1014 XY",
    date: "2025-10-28",
    autorisePar: "—",
    status: "en_attente",
  },
  {
    id: "ss5",
    reference: "SS/2025/005",
    dossierId: "D-0020",
    motif: "Raison diplomatique",
    vehicule: "AB 1019 BB",
    date: "2025-10-22",
    autorisePar: "Inspecteur Chef",
    status: "refusé",
  },
];

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

export const ACTIVITES_RECENTES: ActiviteRecente[] = [
  {
    id: "act1",
    action: "Dossier créé",
    reference: "DSR/2025/1060",
    user: "S. Lubaki",
    date: "2025-10-29",
    heure: "14:32",
    type: "creation",
  },
  {
    id: "act2",
    action: "Paiement validé",
    reference: "DSR/2025/1058",
    user: "Système",
    date: "2025-10-29",
    heure: "14:15",
    type: "paiement",
  },
  {
    id: "act3",
    action: "Dossier apuré",
    reference: "DSR/2025/1045",
    user: "S. Lubaki",
    date: "2025-10-29",
    heure: "13:50",
    type: "apurement",
  },
  {
    id: "act4",
    action: "Véhicule entré barrière",
    reference: "BAR/0510",
    user: "P. Tshibanda",
    date: "2025-10-29",
    heure: "13:22",
    type: "entree",
  },
  {
    id: "act5",
    action: "Alerte fraude",
    reference: "DSR/2025/1003",
    user: "Système",
    date: "2025-10-29",
    heure: "12:45",
    type: "alerte",
  },
  {
    id: "act6",
    action: "Vérification terminée",
    reference: "DSR/2025/1041",
    user: "J. Kasongo",
    date: "2025-10-29",
    heure: "11:30",
    type: "verification",
  },
  {
    id: "act7",
    action: "Sortie spéciale autorisée",
    reference: "SS/2025/002",
    user: "Inspecteur Chef",
    date: "2025-10-29",
    heure: "10:15",
    type: "sortie",
  },
  {
    id: "act8",
    action: "Dossier créé",
    reference: "DSR/2025/1059",
    user: "S. Lubaki",
    date: "2025-10-28",
    heure: "16:40",
    type: "creation",
  },
  {
    id: "act9",
    action: "Paiement validé",
    reference: "DSR/2025/1055",
    user: "Système",
    date: "2025-10-28",
    heure: "15:20",
    type: "paiement",
  },
  {
    id: "act10",
    action: "Dossier apuré",
    reference: "DSR/2025/1038",
    user: "S. Lubaki",
    date: "2025-10-28",
    heure: "14:00",
    type: "apurement",
  },
];

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
  totalEncaisse: 4850,
  totalCommissions: 1215,
  soldeNet: 3635,
  devise: "USD",
  derniereMaj: "2025-10-29 14:32",
  mouvements: [
    {
      id: "mv1",
      type: "credit",
      montant: 50,
      libelle: "Paiement dossier Direct",
      date: "2025-10-29",
      ref: "DSR/2025/1060",
    },
    {
      id: "mv2",
      type: "debit",
      montant: 15,
      libelle: "Commission partenaire",
      date: "2025-10-29",
      ref: "DSR/2025/1060",
    },
    {
      id: "mv3",
      type: "credit",
      montant: 50,
      libelle: "Paiement dossier Transbordement",
      date: "2025-10-28",
      ref: "DSR/2025/1058",
    },
    {
      id: "mv4",
      type: "debit",
      montant: 12.5,
      libelle: "Commission partenaire",
      date: "2025-10-28",
      ref: "DSR/2025/1058",
    },
    {
      id: "mv5",
      type: "credit",
      montant: 10,
      libelle: "Paiement dossier Vrac",
      date: "2025-10-27",
      ref: "DSR/2025/1055",
    },
    {
      id: "mv6",
      type: "credit",
      montant: 10,
      libelle: "Paiement dossier Lot",
      date: "2025-10-27",
      ref: "DSR/2025/1054",
    },
    {
      id: "mv7",
      type: "debit",
      montant: 3,
      libelle: "Commission partenaire",
      date: "2025-10-27",
      ref: "DSR/2025/1055",
    },
    {
      id: "mv8",
      type: "credit",
      montant: 50,
      libelle: "Paiement dossier Direct",
      date: "2025-10-26",
      ref: "DSR/2025/1050",
    },
    {
      id: "mv9",
      type: "debit",
      montant: 15,
      libelle: "Commission partenaire",
      date: "2025-10-26",
      ref: "DSR/2025/1050",
    },
    {
      id: "mv10",
      type: "credit",
      montant: 50,
      libelle: "Paiement dossier Direct",
      date: "2025-10-25",
      ref: "DSR/2025/1048",
    },
  ],
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

export const SECRETAIRES_INSPECTEUR: SecretaireInsp[] = [
  {
    id: "si1",
    nom: "Lubaki",
    postNom: "Ngoma",
    prenom: "Sarah",
    matricule: "SEC-001",
    fonction: "Secrétaire Inspecteur",
    identifiant: "s.lubaki",
    motDePasse: "S3c@2025!",
    inspecteurId: "u5",
    status: "actif",
    dateCreation: "2025-07-10",
    dossiersAssignes: 24,
    dossiersTraites: 18,
  },
  {
    id: "si2",
    nom: "Mukadi",
    postNom: "Kalume",
    prenom: "Pierre",
    matricule: "SEC-002",
    fonction: "Secrétaire Inspecteur",
    identifiant: "p.mukadi",
    motDePasse: "Mk@d1Sec!",
    inspecteurId: "u5",
    status: "actif",
    dateCreation: "2025-08-15",
    dossiersAssignes: 19,
    dossiersTraites: 14,
  },
  {
    id: "si3",
    nom: "Tshibangu",
    postNom: "Mwanza",
    prenom: "Grâce",
    matricule: "SEC-003",
    fonction: "Secrétaire Inspecteur",
    identifiant: "g.tshibangu",
    motDePasse: "Gr@ce2025",
    inspecteurId: "u5",
    status: "désactivé",
    dateCreation: "2025-06-01",
    dossiersAssignes: 8,
    dossiersTraites: 8,
  },
];

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

export const DOSSIER_ASSIGNMENTS: DossierAssignment[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `da-${pad(i + 1, 3)}`,
  dossierId: `D-${pad(i + 1)}`,
  dossierRef: `DSR/2025/${pad(1000 + i)}`,
  secretaireId: i % 2 === 0 ? "si1" : "si2",
  dateAssignment: `2025-10-${pad(5 + (i % 24), 2)}`,
  status: (["assigné", "vérifié", "apuré", "rejeté"] as const)[i % 4],
  importateur: rand(importateurs),
  type: rand(types),
}));

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
  commissions: [
    { typeDossierId: "td1", typeCommission: "pourcentage", valeurCommission: 12 },
    { typeDossierId: "td2", typeCommission: "pourcentage", valeurCommission: 15 },
    { typeDossierId: "td3", typeCommission: "pourcentage", valeurCommission: 10 },
    { typeDossierId: "td8", typeCommission: "pourcentage", valeurCommission: 14 },
  ],
  statut: "actif",
  dateCreation: "2025-10-01",
  observation: "Super Admin gère et paie les commissions par dossier traité.",
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

export const DOSSIER_SHARE_ALLOCATIONS: DossierShareAllocation[] = [
  {
    id: "ds1",
    dossierId: "D-101",
    dossierRef: "DSR/2025/1101",
    dossierType: "direct",
    montantDossier: 4200,
    pourcentageCommission: 12,
    montantCommission: 504,
    statut: "en attente",
    dateAttribution: "2025-10-05",
    observation: "Commission attribuée selon tarif type.",
  },
  {
    id: "ds2",
    dossierId: "D-102",
    dossierRef: "DSR/2025/1102",
    dossierType: "transbordement",
    montantDossier: 3800,
    pourcentageCommission: 15,
    montantCommission: 570,
    statut: "contrôlé",
    dateAttribution: "2025-10-08",
    observation: "Contrôle et validation effectués par Super Admin.",
  },
  {
    id: "ds3",
    dossierId: "D-103",
    dossierRef: "DSR/2025/1103",
    dossierType: "vrac",
    montantDossier: 5200,
    pourcentageCommission: 10,
    montantCommission: 520,
    statut: "payé",
    dateAttribution: "2025-10-01",
    observation: "Commission versée au Chef Barrière Ouganda.",
  },
];

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

export const EMPTY_MANIFEST_BATCH_BILLINGS: EmptyManifestBatchBilling[] = [
  {
    id: "embb1",
    batchNumber: "BATCH/2025/001",
    nombreManifests: 5,
    montantTotal: 125,
    montantParUnit: 25,
    statut: "à facturer",
    dateCreation: "2025-10-06",
    manifests: ["EM001", "EM002", "EM003", "EM004", "EM005"],
    responsable: "Super Admin",
    observation: "Lot de facturation October 2025 — manifests vides en masse.",
  },
  {
    id: "embb2",
    batchNumber: "BATCH/2025/002",
    nombreManifests: 7,
    montantTotal: 175,
    montantParUnit: 25,
    statut: "facturé",
    dateCreation: "2025-10-09",
    dateFacturation: "2025-10-10",
    manifests: ["EM006", "EM007", "EM008", "EM009", "EM010", "EM011", "EM012"],
    responsable: "Super Admin",
    observation: "Facture groupée émise et en attente de paiement.",
  },
];

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

export const APUREMENT_SUBMISSIONS: ApurementSubmission[] = [
  {
    id: "ap1",
    dossierId: "D-0001",
    dossierRef: "DSR/2025/1000",
    secretaireId: "si1",
    secretaireNom: "S. Lubaki",
    refDouane: "E-101",
    dateApurement: "2025-10-20",
    dateSoumission: "2025-10-21",
    status: "validé",
    importateur: "Société Atlas SARL",
    type: "direct",
  },
  {
    id: "ap2",
    dossierId: "D-0003",
    dossierRef: "DSR/2025/1002",
    secretaireId: "si1",
    secretaireNom: "S. Lubaki",
    refDouane: "E-102",
    dateApurement: "2025-10-22",
    dateSoumission: "2025-10-23",
    status: "validé",
    importateur: "Global Cargo Ltd",
    type: "transbordement",
  },
  {
    id: "ap3",
    dossierId: "D-0005",
    dossierRef: "DSR/2025/1004",
    secretaireId: "si2",
    secretaireNom: "P. Mukadi",
    refDouane: "E-103",
    dateApurement: "2025-10-24",
    dateSoumission: "2025-10-24",
    status: "soumis",
    importateur: "Kivu Import",
    type: "vrac",
  },
  {
    id: "ap4",
    dossierId: "D-0007",
    dossierRef: "DSR/2025/1006",
    secretaireId: "si2",
    secretaireNom: "P. Mukadi",
    refDouane: "E-104",
    dateApurement: "2025-10-25",
    dateSoumission: "2025-10-25",
    status: "soumis",
    importateur: "PetroPlus SA",
    type: "direct",
  },
  {
    id: "ap5",
    dossierId: "D-0009",
    dossierRef: "DSR/2025/1008",
    secretaireId: "si1",
    secretaireNom: "S. Lubaki",
    refDouane: "E-105",
    dateApurement: "2025-10-26",
    dateSoumission: "2025-10-26",
    status: "rejeté",
    importateur: "Sahel Logistics",
    type: "lot",
  },
  {
    id: "ap6",
    dossierId: "D-0011",
    dossierRef: "DSR/2025/1010",
    secretaireId: "si1",
    secretaireNom: "S. Lubaki",
    refDouane: "E-106",
    dateApurement: "2025-10-27",
    dateSoumission: "2025-10-27",
    status: "soumis",
    importateur: "Imex Trading Co.",
    type: "transbordement",
  },
  {
    id: "ap7",
    dossierId: "D-0013",
    dossierRef: "DSR/2025/1012",
    secretaireId: "si2",
    secretaireNom: "P. Mukadi",
    refDouane: "E-107",
    dateApurement: "2025-10-28",
    dateSoumission: "2025-10-28",
    status: "soumis",
    importateur: "Société Atlas SARL",
    type: "direct",
  },
  {
    id: "ap8",
    dossierId: "D-0015",
    dossierRef: "DSR/2025/1014",
    secretaireId: "si1",
    secretaireNom: "S. Lubaki",
    refDouane: "E-108",
    dateApurement: "2025-10-29",
    dateSoumission: "2025-10-29",
    status: "soumis",
    importateur: "Global Cargo Ltd",
    type: "vrac",
  },
];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  category: "système" | "sécurité" | "opération" | "subordonné" | "alerte";
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Nouveau compte créé",
    message: "Inspecteur de bureau créé par direction Nord-Kivu",
    date: "2025-10-29",
    read: false,
    category: "subordonné",
  },
  {
    id: "n2",
    title: "Alerte douane",
    message: "Tentative de fraude détectée à Kasindi",
    date: "2025-10-28",
    read: false,
    category: "alerte",
  },
  {
    id: "N1",
    title: "Mise à jour système",
    message: "Le module de gestion des lots a été mis à jour pour supporter l'ajout multiple de véhicules.",
    date: "2025-10-29 10:00",
    read: false,
    category: "système",
  },
  {
    id: "N2",
    title: "Nouvelle connexion détectée",
    message: "Une connexion à votre compte a été détectée depuis un nouvel appareil à Goma.",
    date: "2025-10-28 15:45",
    read: true,
    category: "sécurité",
  },
  {
    id: "N3",
    title: "Dossier validé par l'Inspecteur",
    message: "Le dossier RD-0008 a été validé et est prêt pour l'apurement.",
    date: "2025-10-28 09:30",
    read: false,
    category: "opération",
  },
  {
    id: "N4",
    title: "Maintenance planifiée",
    message: "Une maintenance du serveur est prévue pour ce dimanche à 02:00 du matin.",
    date: "2025-10-27 18:00",
    read: true,
    category: "système",
  },
];
