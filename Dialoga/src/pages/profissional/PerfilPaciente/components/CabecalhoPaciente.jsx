// ============================================================
// CabecalhoPaciente
// Cartão do topo do perfil (RF214–RF217, RF220, RF223, RF226, RF315), como no Figma:
// avatar, nome, selo de status, selo "Na plataforma" (só quem tem conta no Dialoga),
// e-mail, telefone, "Desde [mês] de [ano]" e "Próx. [data]".
// À direita: "Solicitar acesso" (sem acesso) ou o selo "Solicitação enviada".
// "Remover paciente" não está no Figma (pedido da equipe): fica no mesmo lugar,
// abaixo do botão de acesso no desktop e no rodapé do cartão no mobile.
// Paciente externo: sem e-mail, telefone, "Na plataforma" e "Solicitar acesso".
// Props:
//   paciente          -> perfil (ver buscarPerfil em perfilMock.js)
//   onSolicitarAcesso -> clique em "Solicitar acesso"
//   onRemover         -> clique em "Remover paciente"
// ============================================================
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeCheck, IconeLixeira } from '../../../../components/Icones'
import { IconeCalendarioPequeno } from '../../../../components/IconesAgenda'
import { doisPrimeirosNomes, formatarDataBR } from '../../../../utils/formatadores'
import { statusDe } from '../../Pacientes/components/statusPaciente'
import { formatarMesAnoExtenso } from './datasPerfil'
import { AJUSTE_SELO } from './estilosPerfil'

// avatar de 56px com iniciais de 18px em negrito (o AvatarIniciais compartilhado não muda)
const AJUSTE_AVATAR = 'shrink-0 [&>div]:h-14 [&>div]:w-14 [&>div]:text-[18px] [&>div]:font-bold'

// "Remover paciente": botão de texto vermelho discreto
const BOTAO_REMOVER =
  'flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-semibold text-erro transition-colors duration-200 hover:bg-erro-fundo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

// botão de acesso ou o selo de pedido enviado (RF223 e RF226)
function Acesso({ acesso, onSolicitarAcesso }) {
  if (acesso === 'nao_solicitado') {
    return (
      <button
        type="button"
        onClick={onSolicitarAcesso}
        className="h-[34px] shrink-0 cursor-pointer whitespace-nowrap rounded-xl border border-borda-forte bg-fundo-card px-3 text-[12px] font-semibold text-primaria transition-colors duration-200 hover:bg-borda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        Solicitar acesso
      </button>
    )
  }
  if (acesso === 'pendente') {
    return (
      <span className="inline-flex h-[30px] shrink-0 items-center whitespace-nowrap rounded-full border border-alerta-borda bg-alerta-fundo px-3 text-[12px] font-semibold text-alerta-escura">
        Solicitação enviada
      </span>
    )
  }
  return null
}

export default function CabecalhoPaciente({ paciente, onSolicitarAcesso, onRemover }) {
  const status = statusDe(paciente.status)
  const botaoRemover = (
    <button type="button" onClick={onRemover} className={BOTAO_REMOVER}>
      <IconeLixeira tamanho={13} className="[stroke-width:1.8]" />
      Remover paciente
    </button>
  )

  return (
    <Card className="px-5 py-[21px]">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className={AJUSTE_AVATAR}>
            <AvatarIniciais nome={doisPrimeirosNomes(paciente.nome).join(' ')} />
          </div>

          <div className="min-w-0 flex-1">
            {/* mobile: o botão/selo de acesso "flutua" no canto direito; o nome contorna e o
                e-mail e o telefone usam a largura toda logo abaixo (sem quebrar no meio) */}
            <div className="float-right mb-1 ml-2 sm:hidden">
              <Acesso acesso={paciente.acesso} onSolicitarAcesso={onSolicitarAcesso} />
            </div>

            {/* nome e selos na mesma linha; no mobile os selos descem */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="mr-px break-words text-[20px] font-extrabold leading-7 text-texto">{paciente.nome}</h1>
              <span className={AJUSTE_SELO}>
                <Selo tom={status.tom}>{status.rotulo}</Selo>
              </span>
              {paciente.origem === 'plataforma' && (
                <span className={AJUSTE_SELO}>
                  <Selo tom="primaria">
                    <IconeCheck tamanho={10} className="[stroke-width:1.8]" />
                    Na plataforma
                  </Selo>
                </span>
              )}
            </div>

            {paciente.email && <p className="mt-1 break-words text-[14px] leading-5 text-secundaria">{paciente.email}</p>}
            {paciente.telefone && <p className="text-[14px] leading-5 text-secundaria">{paciente.telefone}</p>}

            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] leading-4 text-secundaria">
              <span>Desde {formatarMesAnoExtenso(paciente.desde)}</span>
              {paciente.proximaConsulta && (
                <span className="flex items-center gap-1.5 font-semibold text-primaria">
                  <IconeCalendarioPequeno tamanho={11} className="[stroke-width:1.8]" />
                  Próx. {formatarDataBR(paciente.proximaConsulta)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* desktop/tablet: acesso e "Remover paciente" numa coluna à direita */}
        <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
          <Acesso acesso={paciente.acesso} onSolicitarAcesso={onSolicitarAcesso} />
          {botaoRemover}
        </div>
      </div>

      {/* mobile: "Remover paciente" no rodapé do cartão, para não apertar o nome */}
      <div className="mt-3 flex justify-end sm:hidden">{botaoRemover}</div>
    </Card>
  )
}
