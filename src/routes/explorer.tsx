import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Le module « Explorer » (carte) est temporairement masqué.
 * Le code, les données et les routes sont conservés : il suffira de retirer
 * ce `beforeLoad` pour le réactiver.
 */
export const Route = createFileRoute("/explorer")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
