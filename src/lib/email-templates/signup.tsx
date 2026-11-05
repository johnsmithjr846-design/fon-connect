import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Kú àbɔ̀ ! Bienvenue sur FonConnect — confirmez votre adresse email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={flag}>
          <span style={{ ...stripe, backgroundColor: '#008751' }} />
          <span style={{ ...stripe, backgroundColor: '#FCD116' }} />
          <span style={{ ...stripe, backgroundColor: '#E8112D' }} />
        </Section>
        <Text style={brand}>
          <Link href={siteUrl} style={brandLink}>FonConnect</Link>
        </Text>
        <Text style={slogan}>Parlez le Bénin, naturellement</Text>

        <Heading style={h1}>Kú àbɔ̀ ! Bienvenue dans l'aventure FonConnect</Heading>
        <Text style={text}>
          Merci d'avoir rejoint FonConnect ! Que vous soyez là pour apprendre le fon pas à pas,
          traduire vos échanges au quotidien ou découvrir la culture béninoise, vous êtes au bon endroit.
        </Text>

        <Text style={subtitle}>Ce qui vous attend :</Text>
        <Text style={item}>🗣️ <strong>Traducteur instantané</strong> — textes et enregistrements vocaux en fon et en français.</Text>
        <Text style={item}>📚 <strong>Leçons interactives</strong> — vocabulaire, grammaire et quiz ludiques à votre rythme.</Text>
        <Text style={item}>🤖 <strong>Assistant Ayi</strong> — votre tuteur d'apprentissage toujours disponible.</Text>
        <Text style={item}>📖 <strong>Phrasebook</strong> — les expressions indispensables au Bénin.</Text>

        <Text style={text}>
          Pour activer votre compte ({recipient}), confirmez votre adresse email :
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmer mon adresse email
        </Button>

        <Text style={hint}>
          Vous ne voyez pas cet email ? <strong>Vérifiez votre dossier de courriers indésirables (spams)</strong>,
          puis glissez-le dans votre boîte de réception ou ajoutez-nous à vos contacts pour recevoir la suite.
        </Text>

        <Text style={footer}>
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </Text>
        <Text style={contact}>
          Une question ? Écrivez-nous à{' '}
          <Link href="mailto:fonconnect@outlook.fr" style={link}>
            fonconnect@outlook.fr
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px' }
const flag = { margin: '0 0 16px' }
const stripe = { display: 'inline-block', width: '33%', height: '6px' }
const brand = { fontSize: '26px', fontWeight: 'bold' as const, color: '#008751', margin: '0' }
const brandLink = { color: '#008751', textDecoration: 'none' }
const slogan = { fontSize: '12px', color: '#c2410c', letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '2px 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1f2937', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }
const subtitle = { fontSize: '15px', fontWeight: 'bold' as const, color: '#1f2937', margin: '0 0 8px' }
const item = { fontSize: '14px', color: '#4b5563', lineHeight: '1.5', margin: '0 0 8px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#008751',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '8px',
  padding: '14px 22px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const contact = { fontSize: '12px', color: '#999999', margin: '10px 0 0' }
