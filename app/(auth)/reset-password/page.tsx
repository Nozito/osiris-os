import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function ResetPasswordPage() {
  return (
    <SetPasswordForm
      redirectTo="/login"
      copy={{
        title: "Nouveau mot de passe",
        description: "Choisissez un nouveau mot de passe.",
        submitLabel: "Mettre à jour le mot de passe",
        submitPendingLabel: "Mise à jour...",
        successTitle: "Mot de passe mis à jour",
        successDescription: "Redirection vers la connexion...",
        invalidTitle: "Lien invalide ou expiré",
        invalidDescription:
          "Ce lien de réinitialisation n'est plus valide. Demandez-en un nouveau.",
        invalidActionHref: "/forgot-password",
        invalidActionLabel: "Nouveau lien",
      }}
    />
  );
}
