const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Les paiements réels ne sont pas encore activés sur cette version du site.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-accent/50 bg-accent/20 px-4 py-2 text-center text-sm text-accent-foreground">
        Mode test : aucun paiement réel n'est effectué depuis l'aperçu.
      </div>
    );
  }
  return null;
}
