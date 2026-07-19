import { SetPasswordForm } from "@/components/auth/set-password-form";
import { completeInvite } from "./actions";

export default function AcceptInvitePage() {
  return (
    <SetPasswordForm
      redirectTo="/login"
      onSuccess={completeInvite}
      copy={{
        title: "Bienvenue chez Osiris",
        description: "Choisissez un mot de passe pour activer votre accès.",
        submitLabel: "Activer mon accès",
        submitPendingLabel: "Activation...",
        successTitle: "Accès activé",
        successDescription: "Redirection vers la connexion...",
        invalidTitle: "Invitation invalide ou expirée",
        invalidDescription:
          "Ce lien d'invitation n'est plus valide. Demandez à votre interlocuteur Osiris de vous en renvoyer un.",
        invalidActionHref: "/login",
        invalidActionLabel: "Retour à la connexion",
      }}
    />
  );
}
