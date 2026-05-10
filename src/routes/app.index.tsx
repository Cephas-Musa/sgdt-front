import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import SuperAdminDash from "@/dashboards/SuperAdminDash";
import DirecteurDash from "@/dashboards/DirecteurDash";
import DirecteurProvincialDash from "@/dashboards/DirecteurProvincialDash";
import ChefBureauReprDash from "@/dashboards/ChefBureauReprDash";
import OperateurSaisieDash from "@/dashboards/OperateurSaisieDash";
import ChefBarriereDash from "@/dashboards/ChefBarriereDash";
import TypingOperatorDash from "@/dashboards/TypingOperatorDash";
import BrigadierBarriereDash from "@/dashboards/BrigadierBarriereDash";
import SecretaireInspecteurDash from "@/dashboards/SecretaireInspecteurDash";
import BrigadierEntrepotDash from "@/dashboards/BrigadierEntrepotDash";
import BarriereControleDash from "@/dashboards/BarriereControleDash";
import InspecteurChefDash from "@/dashboards/InspecteurChefDash";
import VerificateurDash from "@/dashboards/VerificateurDash";
import CBVerificationDash from "@/dashboards/CBVerificationDash";
import ChefRechercheDash from "@/dashboards/ChefRechercheDash";
import ChefManifestDash from "@/dashboards/ChefManifestDash";
import PercepteurDash from "@/dashboards/PercepteurDash";
import ChefEntrepotLogDash from "@/dashboards/ChefEntrepotLogDash";
import ChefEntrepotDouaneDash from "@/dashboards/ChefEntrepotDouaneDash";
import AgentPointageDash from "@/dashboards/AgentPointageDash";
import GenericDash from "@/dashboards/GenericDash";
import PartenaireDash from "@/dashboards/PartenaireDash";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case "super_admin": return <SuperAdminDash />;
    case "directeur": return <DirecteurDash />;
    case "directeur_provincial": return <DirecteurProvincialDash />;
    case "inspecteur_chef": return <InspecteurChefDash />;
    case "agent_controle": return <InspecteurChefDash />;
    case "chef_bureau_repr": return <ChefBureauReprDash />;
    case "operateur_saisie": return <OperateurSaisieDash />;
    case "chef_barriere": return <ChefBarriereDash />;
    case "typing_operator": return <TypingOperatorDash />;
    case "brigadier_barriere": return <BrigadierBarriereDash />;
    case "secretaire_inspecteur": return <SecretaireInspecteurDash />;
    case "brigadier_entrepot": return <BrigadierEntrepotDash />;
    case "barriere_controle": return <BarriereControleDash />;
    case "verificateur": return <VerificateurDash />;
    case "cb_verification": return <CBVerificationDash />;
    case "chef_recherche": return <ChefRechercheDash />;
    case "chef_manifest": return <ChefManifestDash />;
    case "percepteur": return <PercepteurDash />;
    case "chef_entrepot_log": return <ChefEntrepotLogDash />;
    case "chef_entrepot_douane": return <ChefEntrepotDouaneDash />;
    case "agent_pointage": return <AgentPointageDash />;
    case "partenaire": return <PartenaireDash />;
    default: return <GenericDash />;
  }
}
