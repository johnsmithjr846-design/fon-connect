import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/politique-confidentialite")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — FonConnect" },
      {
        name: "description",
        content:
          "Comment FonConnect collecte, utilise et protège vos données : traductions, enregistrements vocaux, compte et assistant IA.",
      },
      { property: "og:title", content: "Politique de confidentialité — FonConnect" },
      {
        property: "og:description",
        content: "Données collectées, finalités, durées de conservation et vos droits sur FonConnect.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/politique-confidentialite" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/politique-confidentialite" }],
  }),
});

function PrivacyPage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Cette page est maintenue par l'équipe FonConnect pour expliquer, en langage clair, quelles données l'application traite lorsque vous traduisez, apprenez ou discutez avec l'assistant."
    >
      <Section title="1. Données que nous traitons">
        <ul className="space-y-2">
          <li>
            <strong>Compte :</strong> adresse e-mail, nom d'affichage et identifiant technique.
          </li>
          <li>
            <strong>Contenus de traduction :</strong> textes saisis, et selon les fonctionnalités
            utilisées, enregistrements vocaux ou photos de texte à traduire.
          </li>
          <li>
            <strong>Conversations avec l'assistant IA :</strong> messages envoyés et réponses
            générées.
          </li>
          <li>
            <strong>Apprentissage :</strong> progression dans les leçons, favoris du phrasebook,
            historique de traduction.
          </li>
          <li>
            <strong>Données techniques :</strong> type d'appareil, langue, journaux d'erreurs et
            mesures d'usage nécessaires au bon fonctionnement.
          </li>
        </ul>
      </Section>

      <Section title="2. Pourquoi nous les utilisons">
        <ul className="space-y-2">
          <li>fournir la traduction et les réponses de l'assistant ;</li>
          <li>sauvegarder votre historique, vos favoris et votre progression ;</li>
          <li>sécuriser les comptes et prévenir les abus ;</li>
          <li>
            améliorer la qualité linguistique du fon (les contenus utilisés à cette fin sont
            anonymisés lorsque cela est possible).
          </li>
        </ul>
        <p>
          Nous ne vendons pas vos données et nous ne les utilisons pas pour de la publicité ciblée.
        </p>
      </Section>

      <Section title="3. Traitement par l'intelligence artificielle">
        <p>
          La traduction automatique et l'assistant reposent sur des modèles d'IA exécutés par des
          prestataires techniques. Les contenus que vous soumettez leur sont transmis uniquement
          pour produire la réponse demandée. Évitez d'y saisir des informations sensibles
          (identifiants, données bancaires, données de santé).
        </p>
      </Section>

      <Section title="4. Prestataires et hébergement">
        <p>
          FonConnect s'appuie sur des prestataires d'infrastructure pour l'hébergement, la base de
          données, l'authentification et les modèles d'IA. Ils agissent selon nos instructions et
          n'utilisent pas vos données pour leur propre compte.
        </p>
      </Section>

      <Section title="5. Conservation">
        <ul className="space-y-2">
          <li>Données de compte : conservées tant que le compte est actif.</li>
          <li>
            Historique de traduction et conversations : conservés jusqu'à leur suppression par vous
            ou la suppression du compte.
          </li>
          <li>Journaux techniques : conservés sur une durée courte, à des fins de diagnostic.</li>
        </ul>
        <p>La suppression du compte entraîne la suppression ou l'anonymisation des données liées.</p>
      </Section>

      <Section title="6. Vos droits">
        <p>
          Vous pouvez demander l'accès, la rectification, la suppression, la limitation ou la
          portabilité de vos données, et vous opposer à certains traitements. Écrivez à{" "}
          <strong>privacy@fonconnect.app</strong> ; nous répondons dans un délai raisonnable après
          vérification de votre identité.
        </p>
      </Section>

      <Section title="7. Enfants">
        <p>
          FonConnect n'est pas destiné aux enfants de moins de 13 ans. Pour un usage scolaire, le
          compte doit être créé et supervisé par un adulte responsable.
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Les échanges avec l'application sont chiffrés en transit (HTTPS) et l'accès aux données est
          restreint par des règles d'autorisation côté serveur. Aucun système n'étant infaillible,
          signalez toute faille suspectée à <strong>security@fonconnect.app</strong>.
        </p>
      </Section>

      <Section title="9. Modifications">
        <p>
          Cette politique peut évoluer avec le service. En cas de changement important, nous
          informons les utilisateurs dans l'application ou par e-mail.
        </p>
      </Section>
    </LegalLayout>
  );
}
