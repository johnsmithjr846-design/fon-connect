import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, Section } from "@/components/legal/LegalLayout";

export const Route = createFileRoute("/conditions-utilisation")({
  component: ConditionsPage,
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — FonConnect" },
      {
        name: "description",
        content:
          "Conditions générales d'utilisation de FonConnect : traduction français ↔ fon, assistant IA, leçons et phrasebook.",
      },
      { property: "og:title", content: "Conditions d'utilisation — FonConnect" },
      {
        property: "og:description",
        content: "Règles d'usage du service de traduction et d'apprentissage du fon FonConnect.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/conditions-utilisation" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/conditions-utilisation" }],
  }),
});

function ConditionsPage() {
  return (
    <LegalLayout
      title="Conditions générales d'utilisation"
      intro="Ces conditions encadrent l'utilisation de FonConnect, application de traduction et d'apprentissage du fon, langue du Bénin. En créant un compte ou en utilisant le service, vous les acceptez."
    >
      <Section title="1. Objet du service">
        <p>
          FonConnect propose la traduction français ↔ fon (texte, et selon les fonctionnalités
          disponibles voix et image), un assistant conversationnel basé sur l'intelligence
          artificielle, des leçons d'apprentissage, un guide de conversation (phrasebook) et des
          contenus culturels.
        </p>
        <p>
          Le service est destiné aux touristes, à la diaspora, aux étudiants, aux professionnels et
          à toute personne souhaitant communiquer en fon.
        </p>
      </Section>

      <Section title="2. Compte utilisateur">
        <ul className="space-y-2">
          <li>Vous devez fournir des informations exactes lors de la création de votre compte.</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
          <li>
            Un compte est personnel. Toute activité effectuée depuis votre compte est réputée être
            la vôtre.
          </li>
        </ul>
      </Section>

      <Section title="3. Qualité des traductions">
        <p>
          Le fon est une langue à forte variation dialectale et tonale. Les traductions, y compris
          celles générées par l'IA, sont fournies <strong>à titre indicatif</strong> et peuvent
          contenir des erreurs ou des approximations culturelles.
        </p>
        <p>
          FonConnect ne doit pas être utilisé seul pour des usages critiques (médical, juridique,
          administratif, sécurité). Faites appel à un traducteur humain qualifié dans ces contextes.
        </p>
      </Section>

      <Section title="4. Usage acceptable">
        <p>Il est interdit d'utiliser FonConnect pour :</p>
        <ul className="space-y-2">
          <li>diffuser des contenus haineux, illicites, diffamatoires ou harcelants ;</li>
          <li>porter atteinte aux droits d'autrui ou à la vie privée ;</li>
          <li>
            extraire massivement les contenus, contourner les limites d'usage ou perturber le
            service (scraping, rétro-ingénierie, tests d'intrusion non autorisés) ;
          </li>
          <li>revendre ou redistribuer le service sans autorisation écrite.</li>
        </ul>
      </Section>

      <Section title="5. Contenus soumis et propriété intellectuelle">
        <p>
          Vous conservez la propriété des textes, enregistrements et images que vous soumettez. Vous
          accordez à FonConnect une licence limitée permettant de les traiter afin de fournir la
          traduction et les réponses de l'assistant.
        </p>
        <p>
          Les contenus pédagogiques, le corpus linguistique, la marque et l'interface de FonConnect
          restent la propriété de leur éditeur et ne peuvent être réutilisés sans autorisation.
        </p>
      </Section>

      <Section title="6. Offres et paiements">
        <p>
          FonConnect peut proposer une version gratuite avec limites d'usage et des formules payantes
          (abonnement ou achat ponctuel). Les prix, la durée et les modalités de renouvellement sont
          affichés avant tout paiement. Sauf mention contraire, les abonnements se renouvellent
          automatiquement et peuvent être résiliés à tout moment pour la période suivante.
        </p>
      </Section>

      <Section title="7. Disponibilité et évolutions">
        <p>
          Le service est fourni « en l'état ». Des interruptions peuvent survenir pour maintenance
          ou incident technique. Les fonctionnalités peuvent évoluer, notamment celles reposant sur
          des modèles d'IA et des dictionnaires en cours d'enrichissement.
        </p>
      </Section>

      <Section title="8. Responsabilité">
        <p>
          Dans les limites permises par la loi, la responsabilité de FonConnect ne peut être engagée
          pour les dommages indirects résultant d'une erreur de traduction, d'une indisponibilité ou
          d'un usage non conforme du service.
        </p>
      </Section>

      <Section title="9. Résiliation">
        <p>
          Vous pouvez supprimer votre compte à tout moment. Nous pouvons suspendre un compte en cas
          de violation grave ou répétée des présentes conditions.
        </p>
      </Section>

      <Section title="10. Droit applicable et contact">
        <p>
          Les présentes conditions sont régies par le droit applicable au lieu d'établissement de
          l'éditeur. En cas de question ou de litige, écrivez-nous d'abord à{" "}
          <strong>contact@fonconnect.app</strong> afin de rechercher une solution amiable.
        </p>
      </Section>
    </LegalLayout>
  );
}
