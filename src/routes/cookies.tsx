import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Utilisation des cookies — FonConnect" },
      {
        name: "description",
        content:
          "Cookies et stockage local utilisés par FonConnect : session, préférences de langue, mesure d'audience et gestion de votre consentement.",
      },
      { property: "og:title", content: "Utilisation des cookies — FonConnect" },
      {
        property: "og:description",
        content: "Quels cookies FonConnect dépose, pourquoi, et comment les contrôler.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/cookies" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
});

function CookiesPage() {
  return (
    <LegalLayout
      title="Utilisation des cookies"
      intro="FonConnect utilise des cookies et des technologies de stockage local (localStorage) pour vous garder connecté, mémoriser vos préférences de langue et comprendre l'usage de l'application."
    >
      <Section title="1. Cookies strictement nécessaires">
        <p>
          Indispensables au fonctionnement : maintien de votre session de connexion, sécurité des
          formulaires, équilibrage de charge. Ils ne peuvent pas être désactivés sans rendre
          l'application inutilisable.
        </p>
      </Section>

      <Section title="2. Préférences">
        <p>
          Mémorisent la langue d'affichage, le sens de traduction (français → fon ou fon →
          français), le thème et vos favoris du phrasebook conservés sur l'appareil.
        </p>
      </Section>

      <Section title="3. Mesure d'audience">
        <p>
          Statistiques agrégées d'utilisation (pages consultées, fonctionnalités utilisées, erreurs)
          servant uniquement à améliorer FonConnect. Ces mesures ne servent pas à vous identifier
          individuellement.
        </p>
      </Section>

      <Section title="4. Pas de publicité">
        <p>
          FonConnect ne dépose pas de cookies publicitaires et ne partage pas de traceurs avec des
          régies tierces.
        </p>
      </Section>

      <Section title="5. Gérer vos choix">
        <ul className="space-y-2">
          <li>
            Vous pouvez refuser ou supprimer les cookies depuis les réglages de votre navigateur ou
            de votre appareil.
          </li>
          <li>
            La suppression des cookies vous déconnecte et efface les préférences enregistrées
            localement.
          </li>
          <li>
            Pour toute question sur les traceurs, écrivez à <strong>privacy@fonconnect.app</strong>.
          </li>
        </ul>
      </Section>

      <Section title="6. Durée de conservation">
        <p>
          Les cookies de session expirent à la fermeture de la session ou après une période
          d'inactivité. Les cookies de préférence et de mesure sont conservés au maximum 13 mois,
          puis votre choix vous est à nouveau demandé.
        </p>
      </Section>
    </LegalLayout>
  );
}
