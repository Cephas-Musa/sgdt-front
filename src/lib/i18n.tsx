import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "fr" | "en";

const dict = {
  fr: {
    "app.name": "SGDT",
    "app.tagline": "Système douanier terrain",
    "common.search": "Rechercher",
    "common.add": "Ajouter",
    "common.create": "Créer",
    "common.save": "Enregistrer",
    "common.submit": "Soumettre",
    "common.cancel": "Annuler",
    "common.validate": "Valider",
    "common.approve": "Approuver",
    "common.reject": "Rejeter",
    "common.view": "Voir",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.actions": "Actions",
    "common.status": "Statut",
    "common.date": "Date",
    "common.reference": "Référence",
    "common.type": "Type",
    "common.amount": "Montant",
    "common.loading": "Chargement…",
    "common.empty": "Aucun élément",
    "common.all": "Tous",
    "common.filter": "Filtrer",
    "common.export": "Exporter",
    "common.copy": "Copier",
    "common.generate": "Générer",
    "common.back": "Retour",
    "common.details": "Détails",
    "common.confirm": "Confirmer",
    "common.required": "Obligatoire",
    "common.success": "Succès",
    "common.error": "Erreur",
    "common.copied": "Copié dans le presse-papiers",

    "auth.login": "Connexion",
    "auth.logout": "Déconnexion",
    "auth.username": "Identifiant",
    "auth.password": "Mot de passe",
    "auth.signin": "Se connecter",
    "auth.forgot": "Mot de passe oublié ?",
    "auth.reset": "Réinitialiser",
    "auth.role": "Rôle",
    "auth.selectRole": "Choisir un rôle",
    "auth.changePassword": "Changer le mot de passe",
    "auth.firstLogin": "Première connexion — veuillez définir un nouveau mot de passe.",
    "auth.sessionExpired": "Session expirée. Veuillez vous reconnecter.",
    "auth.demoHint": "Démo : tout identifiant fonctionne. Choisissez un rôle pour explorer.",

    "nav.dashboard": "Tableau de bord",
    "nav.dossiers": "Dossiers",
    "nav.barrieres": "Barrières",
    "nav.entrepots": "Entrepôts",
    "nav.manifest": "Empty Manifest",
    "nav.recherche": "Bureau Recherche",
    "nav.representation": "Bureau Représentation",
    "nav.secretariat": "Secrétariat",
    "nav.comptes": "Comptes",
    "nav.configuration": "Configuration",
    "nav.chat": "Messagerie",
    "nav.alertes": "Alertes",
    "nav.documents": "Documents",
    "nav.profil": "Profil",
    "nav.colisage": "Colisage",
    "nav.appurement": "Apurement",
    "nav.localisation": "Localisation véhicules",
    "nav.parking": "Parking",
    "nav.unites": "Unités spéciales",

    "dossier.new": "Nouveau dossier",
    "dossier.list": "Liste des dossiers",
    "dossier.importateur": "Importateur",
    "dossier.nif": "NIF",
    "dossier.dra": "Référence DRA",
    "dossier.t1": "Référence T1",
    "dossier.vehicule": "Véhicule",
    "dossier.plaqueAv": "Plaque avant",
    "dossier.plaqueAr": "Plaque arrière",
    "dossier.pays": "Pays",
    "dossier.devise": "Devise",
    "dossier.incoterm": "Incoterm",
    "dossier.articles": "Articles",
    "dossier.designation": "Désignation",
    "dossier.position": "Position tarifaire",
    "dossier.quantite": "Quantité",
    "dossier.poids": "Poids (kg)",
    "dossier.fob": "FOB",

    "status.brouillon": "Brouillon",
    "status.attente_paiement": "En attente paiement",
    "status.paye": "Payé",
    "status.en_cours": "En cours",
    "status.verifie": "Vérifié",
    "status.apure": "Apuré",
    "status.rejete": "Rejeté",

    "type.direct": "Direct",
    "type.transbordement": "Transbordement",
    "type.vrac": "Vrac",
    "type.lot": "Lot",
    "type.dechargement": "Déchargement",
    "type.chargement": "Chargement",
    "type.petrolier": "Produit pétrolier",
    "type.autres": "Autres",

    "alert.urgent": "Urgent",
    "alert.important": "Important",
    "alert.info": "Info",

    "msg.paymentRequired": "Paiement requis avant validation.",
    "msg.entryRequired": "Aucune entrée enregistrée — sortie impossible.",
    "msg.balanceLow": "Solde insuffisant — vérifier le compte.",

    "dash.dossiers": "Dossiers",
    "dash.revenus": "Revenus",
    "dash.alertes": "Alertes ouvertes",
    "dash.activite": "Activité récente",
    "dash.recent": "Dossiers récents",

    "theme.light": "Clair",
    "theme.dark": "Sombre",
    "lang.fr": "Français",
    "lang.en": "English",
  },
  en: {
    "app.name": "SGDT",
    "app.tagline": "Field customs system",
    "common.search": "Search",
    "common.add": "Add",
    "common.create": "Create",
    "common.save": "Save",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.validate": "Validate",
    "common.approve": "Approve",
    "common.reject": "Reject",
    "common.view": "View",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.date": "Date",
    "common.reference": "Reference",
    "common.type": "Type",
    "common.amount": "Amount",
    "common.loading": "Loading…",
    "common.empty": "No items",
    "common.all": "All",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.copy": "Copy",
    "common.generate": "Generate",
    "common.back": "Back",
    "common.details": "Details",
    "common.confirm": "Confirm",
    "common.required": "Required",
    "common.success": "Success",
    "common.error": "Error",
    "common.copied": "Copied to clipboard",

    "auth.login": "Sign in",
    "auth.logout": "Sign out",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.signin": "Sign in",
    "auth.forgot": "Forgot password?",
    "auth.reset": "Reset",
    "auth.role": "Role",
    "auth.selectRole": "Select role",
    "auth.changePassword": "Change password",
    "auth.firstLogin": "First login — please set a new password.",
    "auth.sessionExpired": "Session expired. Please sign in again.",
    "auth.demoHint": "Demo: any credentials work. Pick a role to explore.",

    "nav.dashboard": "Dashboard",
    "nav.dossiers": "Files",
    "nav.barrieres": "Border posts",
    "nav.entrepots": "Warehouses",
    "nav.manifest": "Empty Manifest",
    "nav.verification": "Verification & Control",
    "nav.recherche": "Research Office",
    "nav.representation": "Representation Office",
    "nav.secretariat": "Secretariat",
    "nav.comptes": "Accounts",
    "nav.configuration": "Configuration",
    "nav.chat": "Messaging",
    "nav.alertes": "Alerts",
    "nav.documents": "Documents",
    "nav.profil": "Profile",
    "nav.colisage": "Packaging",
    "nav.appurement": "Clearance",
    "nav.localisation": "Vehicle tracking",
    "nav.parking": "Parking",
    "nav.unites": "Special units",

    "dossier.new": "New file",
    "dossier.list": "File list",
    "dossier.importateur": "Importer",
    "dossier.nif": "Tax ID",
    "dossier.dra": "DRA ref.",
    "dossier.t1": "T1 ref.",
    "dossier.vehicule": "Vehicle",
    "dossier.plaqueAv": "Front plate",
    "dossier.plaqueAr": "Rear plate",
    "dossier.pays": "Country",
    "dossier.devise": "Currency",
    "dossier.incoterm": "Incoterm",
    "dossier.articles": "Items",
    "dossier.designation": "Description",
    "dossier.position": "Tariff position",
    "dossier.quantite": "Quantity",
    "dossier.poids": "Weight (kg)",
    "dossier.fob": "FOB",

    "status.brouillon": "Draft",
    "status.attente_paiement": "Awaiting payment",
    "status.paye": "Paid",
    "status.en_cours": "In progress",
    "status.verifie": "Verified",
    "status.apure": "Cleared",
    "status.rejete": "Rejected",

    "type.direct": "Direct",
    "type.transbordement": "Transhipment",
    "type.vrac": "Bulk",
    "type.lot": "Batch",
    "type.colis": "Parcel",
    "type.dechargement": "Unloading",
    "type.chargement": "Loading",
    "type.petrolier": "Petroleum",
    "type.autres": "Other",

    "alert.urgent": "Urgent",
    "alert.important": "Important",
    "alert.info": "Info",

    "msg.paymentRequired": "Payment required before validation.",
    "msg.entryRequired": "No entry recorded — exit not allowed.",
    "msg.balanceLow": "Low balance — check the account.",

    "dash.dossiers": "Files",
    "dash.revenus": "Revenue",
    "dash.alertes": "Open alerts",
    "dash.activite": "Recent activity",
    "dash.recent": "Recent files",

    "theme.light": "Light",
    "theme.dark": "Dark",
    "lang.fr": "Français",
    "lang.en": "English",
  },
} as const;

type Key = keyof (typeof dict)["fr"];

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key | string) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (key: string) => (dict[lang] as Record<string, string>)[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
