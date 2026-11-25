// ============================================================
// ItemPaciente
// Cartão da lista de pacientes do profissional (RF306), como no Figma:
// avatar com a foto do paciente (ou as iniciais, se não tiver foto), nome, selo "Plataforma" (só para quem tem conta no Dialoga),
// "Desde [mês. de ano]", próxima consulta, selo de status e o ícone de anotação.
// Desktop: "Próxima consulta" aparece à esquerda do status.
// Mobile e Tablet (abaixo de 1024px): sem a próxima consulta (frame mobile do Figma)
// e o nome quebra em no máximo 2 linhas quando falta espaço.
// O cartão inteiro abre o perfil do paciente (/profissional/pacientes/:id); o ícone de
// anotação fica por cima do link e abre o pop-up "Anotar — [nome]".
// Paciente "Pendente" (vínculo ainda não aceito): o cartão não abre o perfil e o ícone de
// anotação fica desativado, porque o back só libera perfil e anotações depois do aceite.
// Props:
//   paciente   -> item da lista (ver pacientesProfissionalService.js)
//   onAnotacao -> (paciente) => void, clique no ícone de anotação
//   onResponder -> (paciente, aceitar) => void, botões Aceitar/Recusar do pedido feito pelo paciente
//   ocupado    -> true enquanto a resposta do pedido está sendo enviada
// ============================================================
import { Link } from 'react-router-dom'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeCheck } from '../../../../components/Icones'
import { doisPrimeirosNomes, formatarDataBR } from '../../../../utils/formatadores'
import { formatarDesde } from './datasPacientes'
import { IconeAnotacao } from './iconesPacientes'
import { ROTULO_RECEBIDA, pedidoRecebido, statusDe } from './statusPaciente'

// botões "Aceitar" e "Recusar" (iguais aos da tela Profissionais do paciente):
// 44px de altura, cantos de 12px e texto de 14px em negrito
const BOTAO_RESPOSTA = 'relative z-10 h-11! rounded-xl! text-[14px]! font-bold! lg:w-40!'

// O AvatarIniciais e o Selo compartilhados não mudam; o contêiner só ajusta as
// medidas do Figma (mesmo recurso do AvatarPaciente do Acompanhamento):
// avatar de 44px com iniciais de 14px em negrito
const AJUSTE_AVATAR =
  'shrink-0 [&>div]:h-11 [&>div]:w-11 [&>div]:text-[14px] [&>div]:font-bold [&>img]:h-11 [&>img]:w-11'
// selo com 20px de altura, texto de 12px e 8px de espaço nas laterais
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-5 [&>span]:gap-0.5 [&>span]:px-2 [&>span]:py-0 [&>span]:text-[12px]'

export default function ItemPaciente({ paciente, onAnotacao, onResponder, ocupado = false }) {
  const status = statusDe(paciente.status)
  const pendente = paciente.status === 'pendente'
  const pediuAcesso = pedidoRecebido(paciente) // só aqui o profissional decide
  // subtítulo: "Desde mar. de 2025" ou, se o vínculo ainda não foi aceito, quem precisa aceitar
  let subtitulo = paciente.desde ? `Desde ${formatarDesde(paciente.desde)}` : ''
  if (pendente) subtitulo = paciente.pedidoPor === 'paciente' ? 'Pediu para ser seu paciente' : 'Aguardando o aceite do paciente'

  return (
    // gap-2 + mr-2 no avatar: 16px entre avatar e nome, e só 8px (mínimo) antes do status,
    // para sobrar mais espaço para o nome no celular
    // relative: base do link "esticado"; ao passar o mouse, o fundo fica lilás bem claro
    <Card
      as="li"
      className={`relative flex flex-wrap items-center gap-2 p-[17px] transition-colors duration-200 ${pendente ? '' : 'hover:bg-fundo-suave-2'}`}
    >
      {/* iniciais dos dois primeiros nomes, como no Figma ("João Pedro Alves" -> "JP") */}
      <div className={`mr-2 ${AJUSTE_AVATAR}`}>
        <AvatarIniciais nome={doisPrimeirosNomes(paciente.nome).join(' ')} foto={paciente.fotoUrl} />
      </div>

      <div className="min-w-0 flex-1">
        {/* flex-wrap: no celular, quando nome + selo não cabem na mesma linha, o selo "Plataforma"
            desce para baixo do nome em vez de ficar por cima do selo de status */}
        <div className="flex flex-wrap items-center gap-x-[9px] gap-y-1">
          {/* o nome usa a largura toda da linha: quando nome + selo não cabem juntos, o selo
              desce (flex-wrap) e o nome fica em no máximo 2 linhas (line-clamp-2); um nome
              maior que isso termina em "..." e o nome completo aparece ao passar o mouse (title) */}
          <p title={paciente.nome} className="line-clamp-2 break-words text-[14px] font-bold leading-5 text-texto">
            {/* link "esticado": o after:absolute cobre o cartão todo, então clicar em qualquer
                parte do cartão abre o perfil (o leitor de tela lê só o nome como link).
                Pendente: só o texto, sem link. */}
            {pendente ? (
              paciente.nome
            ) : (
              <Link
                to={`/profissional/pacientes/${paciente.id}`}
                className="rounded-sm after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
              >
                {paciente.nome}
              </Link>
            )}
          </p>
          {paciente.origem === 'plataforma' && (
            <span className={`${AJUSTE_SELO} [&>span]:pl-1.5`}>
              <Selo tom="primaria">
                <IconeCheck tamanho={10} className="[stroke-width:1.8]" />
                Plataforma
              </Selo>
            </span>
          )}
          {/* solicitação recebida: selo amarelo ao lado do nome, como na tela Profissionais do paciente */}
          {pediuAcesso && (
            <span className={AJUSTE_SELO}>
              <Selo tom={ROTULO_RECEBIDA.tom}>{ROTULO_RECEBIDA.rotulo}</Selo>
            </span>
          )}
        </div>
        {subtitulo && <p className="text-[12px] leading-4 text-secundaria">{subtitulo}</p>}
      </div>

      <div className="flex shrink-0 items-center">
        {/* só no desktop; paciente sem consulta marcada não mostra o bloco (Figma: Mariana Costa) */}
        {paciente.proximaConsulta && (
          <div className="mr-4 hidden text-right lg:block">
            <p className="text-[12px] leading-4 text-secundaria">Próxima consulta</p>
            <p className="text-[12px] font-bold leading-4 text-primaria">{formatarDataBR(paciente.proximaConsulta)}</p>
          </div>
        )}

        {!pediuAcesso && (
          <span className={AJUSTE_SELO}>
            <Selo tom={status.tom}>{status.rotulo}</Selo>
          </span>
        )}

        {/* relative z-10: fica por cima do link do cartão; abre o pop-up "Anotar — [nome]".
            Na solicitação recebida quem responde são os botões Aceitar/Recusar (sem o ícone). */}
        {!pediuAcesso && (
        <button
          type="button"
          aria-label={`Anotar sobre ${paciente.nome}`}
          title={pendente ? 'Disponível depois que o vínculo for aceito' : undefined}
          disabled={pendente}
          onClick={() => onAnotacao?.(paciente)}
          className="relative z-10 ml-[15px] grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-secundaria transition-colors duration-200 hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <IconeAnotacao />
        </button>
        )}
      </div>

      {/* solicitação recebida: Aceitar (verde) e Recusar (contorno vermelho) embaixo, na largura
          do cartão, como na tela Profissionais do paciente */}
      {pediuAcesso && onResponder && (
        <div className="grid basis-full grid-cols-2 gap-3 pt-2 lg:flex lg:justify-end">
          <Button
            type="button"
            variante="sucesso"
            carregando={ocupado}
            disabled={ocupado}
            aria-label={`Aceitar a solicitação de ${paciente.nome}`}
            className={BOTAO_RESPOSTA}
            onClick={() => onResponder(paciente, true)}
          >
            Aceitar
          </Button>
          <Button
            type="button"
            variante="perigo-contorno"
            carregando={ocupado}
            disabled={ocupado}
            aria-label={`Recusar a solicitação de ${paciente.nome}`}
            className={BOTAO_RESPOSTA}
            onClick={() => onResponder(paciente, false)}
          >
            Recusar
          </Button>
        </div>
      )}
    </Card>
  )
}