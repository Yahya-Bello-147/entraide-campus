// Traduit les erreurs Supabase en messages clairs pour l'utilisateur.
export function messageErreur(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.";
    case "weak_password":
      return "Mot de passe trop faible : 6 caractères minimum.";
    case "email_address_invalid":
      return "Cette adresse e-mail n'est pas valide.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop d'essais. Patiente quelques minutes puis réessaie.";
    default:
      return "Une erreur est survenue. Réessaie dans un instant.";
  }
}
