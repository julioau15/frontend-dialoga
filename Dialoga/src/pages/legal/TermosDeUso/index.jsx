// ============================================================
// pages/legal/TermosDeUso  (rota pública: /termos-de-uso)
// O texto está em data/termosDeUso.js; o visual, em components/DocumentoLegal.
// ============================================================
import DocumentoLegal from '../../../components/DocumentoLegal'
import { TERMOS_DE_USO } from '../../../data/termosDeUso'

export default function TermosDeUso() {
  return <DocumentoLegal documento={TERMOS_DE_USO} outro={{ texto: 'Política de Privacidade', para: '/politica-de-privacidade' }} />
}
