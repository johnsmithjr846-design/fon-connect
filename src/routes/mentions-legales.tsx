import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/mentions-legales")({
  component: MentionsPage,
  head: () => ({
    meta: [
      { title: "Mentions légales — FonConnect" },
      {
        name: "description",
        content:
          "Éditeur, hébergement et contact de FonConnect, application de traduction et d'apprentissage du fon au Bénin.",
      },
      { property: "og:title", content: "Mentions légales — FonConnect" },
      {
        property: "og:description",
        content: "Informations sur l'éditeur et l'hébergeur de FonConnect.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/mentions-legales" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
});

function MentionsPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro="Informations relatives à l'éditeur et à l'hébergement de FonConnect."
    >
      <Section title="Éditeur">
        <p>
          FonConnect — application de traduction et d'apprentissage du fon.
          <br />
          Raison sociale, forme juridique, adresse et numéro d'immatriculation : à compléter par
          l'éditeur.
          <br />
          Contact : <strong>contact@fonconnect.app</strong>
        </p>
      </Section>

      <Section title="Directeur de la publication">
        <p>À compléter par l'éditeur.</p>
      </Section>

      <Section title="Hébergement">
        <p>
          L'application et sa base de données sont hébergées par des prestataires d'infrastructure
          cloud. Les coordonnées précises de l'hébergeur peuvent être obtenues sur simple demande à{" "}
          <strong>contact@fonconnect.app</strong>.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          La marque FonConnect, l'interface, les contenus pédagogiques et le corpus linguistique sont
          protégés. Toute reproduction non autorisée est interdite.
        </p>
      </Section>

      <Section title="Signalement">
        <p>
          Contenu inapproprié, erreur de traduction ou faille de sécurité :{" "}
          <strong>security@fonconnect.app</strong>.
        </p>
      </Section>
    </LegalLayout>
  );
}
