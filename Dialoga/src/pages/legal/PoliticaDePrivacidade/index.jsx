// ============================================================
// pages/legal/PoliticaDePrivacidade  (rota pública: /politica-de-privacidade)
// O texto está em data/politicaDePrivacidade.js; o visual, em components/DocumentoLegal.
// ============================================================
import DocumentoLegal from '../../../components/DocumentoLegal'
import { POLITICA_DE_PRIVACIDADE } from '../../../data/politicaDePrivacidade'

export default function PoliticaDePrivacidade() {
  return <DocumentoLegal documento={POLITICA_DE_PRIVACIDADE} outro={{ texto: 'Termos de Uso', para: '/termos-de-uso' }} />
}
