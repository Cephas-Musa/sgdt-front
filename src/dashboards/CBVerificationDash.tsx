// CB Vérification — même scénario que le vérificateur
import VerificateurDash from "./VerificateurDash";

export default function CBVerificationDash() {
  // Le CB Vérification a exactement la même interface que le vérificateur
  // mais avec des droits de gestion de comptes en plus (visible via la nav)
  return <VerificateurDash />;
}
