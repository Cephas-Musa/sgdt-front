export type Role =
  | "super_admin"
  | "directeur"
  | "directeur_provincial"
  | "inspecteur_chef"
  | "agent_controle"
  | "chef_bureau_repr"
  | "operateur_saisie"
  | "chef_barriere"
  | "typing_operator"
  | "brigadier_barriere"
  | "secretaire_inspecteur"
  | "verificateur"
  | "cb_verification"
  | "chef_recherche"
  | "chef_manifest"
  | "agent_empty_manifest"
  | "percepteur"
  | "chef_entrepot_log"
  | "chef_entrepot_douane"
  | "brigadier_entrepot"
  | "agent_pointage"
  | "barriere_controle"
  | "partenaire";

export const ROLE_LABELS: Record<Role, { fr: string; en: string }> = {
  super_admin: { fr: "Super Admin", en: "Super Admin" },
  directeur: { fr: "Directeur Général", en: "General Director" },
  directeur_provincial: { fr: "Directeur Provincial", en: "Provincial Director" },
  inspecteur_chef: { fr: "Inspecteur Chef de Bureau", en: "Chief Inspector" },
  agent_controle: { fr: "Agent Cellule Contrôle", en: "Control Cell Agent" },
  chef_bureau_repr: { fr: "Chef Bureau Représentation", en: "Representation Office Head" },
  operateur_saisie: { fr: "Opérateur Saisie", en: "Data Entry Operator" },
  chef_barriere: { fr: "Chef Barrière Ouganda", en: "Uganda Border Post Head" },
  typing_operator: { fr: "Typing Operator", en: "Typing Operator" },
  brigadier_barriere: { fr: "Brigadier Barrière", en: "Border Brigadier" },
  secretaire_inspecteur: { fr: "Secrétaire Inspecteur", en: "Inspector Secretary" },
  verificateur: { fr: "Vérificateur", en: "Verifier" },
  cb_verification: { fr: "CB Vérification", en: "Verification Office Head" },
  chef_recherche: { fr: "Chef Bureau Recherche", en: "Research Office Head" },
  chef_manifest: { fr: "Chef Manifest (ACCAD)", en: "Manifest Head (ACCAD)" },
  agent_empty_manifest: { fr: "Agent Empty Manifest", en: "Empty Manifest Agent" },
  percepteur: { fr: "Percepteur", en: "Tax Collector" },
  chef_entrepot_log: { fr: "Chef Entrepôt Logistique", en: "Logistics Warehouse Head" },
  chef_entrepot_douane: { fr: "Chef Entrepôt Douane", en: "Customs Warehouse Head" },
  brigadier_entrepot: { fr: "Brigadier Entrepôt", en: "Warehouse Brigadier" },
  agent_pointage: { fr: "Agent Pointage", en: "Tally Agent" },
  barriere_controle: { fr: "Barrière Contrôle", en: "Control Barrier" },
  partenaire: { fr: "Partenaire", en: "Partner" },
};

export type NavKey =
  | "dashboard"
  | "dossiers"
  | "barrieres"
  | "entrepots"
  | "manifest"
  | "verification"
  | "recherche"
  | "representation"
  | "secretariat"
  | "comptes"
  | "configuration"
  | "chat"
  | "alertes"
  | "colisage"
  | "appurement"
  | "localisation"
  | "parking"
  | "profil";

export const ROLE_NAV: Record<Role, NavKey[]> = {
  super_admin: ["dashboard", "dossiers", "comptes", "manifest", "chat", "alertes", "profil"],
  directeur: ["dashboard", "dossiers", "alertes", "comptes", "chat", "profil"],
  directeur_provincial: [
    "dashboard",
    "dossiers",
    "barrieres",
    "entrepots",
    "comptes",
    "alertes",
    "chat",
    "profil",
  ],
  inspecteur_chef: [
    "dashboard",
    "dossiers",
    "appurement",
    "localisation",
    "entrepots",
    "secretariat",
    "manifest",
    "verification",
    "alertes",
    "comptes",
    "representation",
    "chat",
    "profil",
  ],
  agent_controle: ["dashboard", "dossiers", "verification", "alertes", "chat", "profil"],
  chef_bureau_repr: ["dashboard", "chat", "profil"],
  operateur_saisie: ["dashboard", "alertes", "chat", "profil"],
  chef_barriere: ["dashboard", "barrieres", "manifest", "comptes", "chat", "profil"],
  typing_operator: ["dashboard", "barrieres", "chat", "profil"],
  brigadier_barriere: ["dashboard", "barrieres", "manifest", "chat", "profil"],
  secretaire_inspecteur: [
    "dashboard",
    "secretariat",
    "appurement",
    "localisation",
    "parking",
    "entrepots",
    "alertes",
    "comptes",
    "representation",
    "chat",
    "profil",
  ],
  verificateur: ["dashboard", "chat", "profil"],
  cb_verification: ["dashboard", "verification", "appurement", "comptes", "chat", "profil"],
  chef_recherche: ["dashboard", "recherche", "appurement", "chat", "profil"],
  chef_manifest: ["dashboard", "manifest", "comptes", "configuration", "chat", "profil"],
  agent_empty_manifest: ["dashboard", "manifest", "barrieres", "chat", "profil"],
  percepteur: ["dashboard", "manifest", "chat", "profil"],
  chef_entrepot_log: ["dashboard", "entrepots", "comptes", "chat", "profil"],
  chef_entrepot_douane: [
    "dashboard",
    "entrepots",
    "appurement",
    "alertes",
    "comptes",
    "chat",
    "profil",
  ],
  brigadier_entrepot: ["dashboard", "entrepots", "chat", "profil"],
  agent_pointage: ["dashboard", "entrepots", "colisage", "chat", "profil"],
  barriere_controle: ["dashboard", "dossiers", "manifest", "chat", "profil"],
  partenaire: ["dashboard", "profil"],
};
