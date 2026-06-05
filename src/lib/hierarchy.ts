// Hiérarchie de création de comptes — chaque chef ne voit que ses subordonnés directs
import type { Role } from "./roles";

/**
 * SUBORDINATES[role] = liste des rôles que ce poste peut créer.
 * Un inférieur ne peut JAMAIS créer son supérieur.
 */
export const SUBORDINATES: Partial<Record<Role, Role[]>> = {
  super_admin: [
    "directeur",
    "directeur_provincial",
    "inspecteur_chef",
    "agent_controle",
    "chef_bureau_repr",
    "operateur_saisie",
    "chef_barriere",
    "typing_operator",
    "brigadier_barriere",
    "secretaire_inspecteur",
    "verificateur",
    "cb_verification",
    "chef_recherche",
    "chef_manifest",
    "agent_empty_manifest",
    "percepteur",
    "chef_entrepot_log",
    "chef_entrepot_douane",
    "brigadier_entrepot",
    "agent_pointage",
    "barriere_controle",
    "manager_entrepot",
    "partenaire",
    "brigadier_controle",
  ],
  // Le DG crée les directeurs provinciaux ET les inspecteurs chefs
  directeur: ["directeur_provincial", "inspecteur_chef"],
  // Le DP crée les inspecteurs chefs et agents de contrôle sous sa province
  directeur_provincial: ["inspecteur_chef", "agent_controle", "chef_bureau_repr", "chef_barriere"],
  // L'inspecteur chef crée les responsables de services
  inspecteur_chef: [
    "secretaire_inspecteur",
    "verificateur",
    "cb_verification",
    "chef_recherche",
    "chef_manifest",
    "chef_entrepot_log",
    "chef_entrepot_douane",
    "chef_barriere",
    "chef_bureau_repr",
    "barriere_controle",
    "manager_entrepot",
    "brigadier_controle",
  ],
  chef_bureau_repr: ["operateur_saisie"],
  chef_barriere: ["typing_operator", "brigadier_barriere"],
  chef_manifest: ["agent_empty_manifest", "percepteur"],
  chef_entrepot_log: ["brigadier_entrepot", "agent_pointage"],
  chef_entrepot_douane: ["brigadier_entrepot", "agent_pointage"],
  cb_verification: ["verificateur"],
  secretaire_inspecteur: [],
};

/**
 * Retourne les rôles créables par un poste donné (subordonnés directs uniquement).
 */
export function getCreatableRoles(role: Role): Role[] {
  return SUBORDINATES[role] ?? [];
}

/**
 * Retourne true si `superiorRole` peut créer/gérer `subordinateRole`.
 */
export function canManage(superiorRole: Role, subordinateRole: Role): boolean {
  const allowed = SUBORDINATES[superiorRole];
  if (!allowed) return false;
  return allowed.includes(subordinateRole);
}
