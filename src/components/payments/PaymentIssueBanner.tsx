import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useEntitlements } from "@/hooks/useEntitlements";

/** Affiché pendant les 7 jours de grâce après un prélèvement refusé. */
export function PaymentIssueBanner() {
  const { lang } = useI18n();
  const en = lang === "en";
  const { entitlements } = useEntitlements();
  if (!entitlements.paymentIssue) return null;

  const until = entitlements.graceUntil
    ? new Date(entitlements.graceUntil).toLocaleDateString(en ? "en-GB" : "fr-FR")
    : null;

  return (
    <div className="flex w-full items-center justify-center gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
      <AlertTriangle className="size-4 shrink-0" aria-hidden />
      <span>
        {en
          ? "Your last payment was declined. Your access stays open"
          : "Votre dernier paiement a été refusé. Votre accès reste ouvert"}
        {until ? (en ? ` until ${until}. ` : ` jusqu'au ${until}. `) : ". "}
        <Link to="/mon-abonnement" className="font-semibold underline">
          {en ? "Update your payment method" : "Mettre à jour votre moyen de paiement"}
        </Link>
      </span>
    </div>
  );
}
