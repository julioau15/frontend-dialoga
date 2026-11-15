// ============================================================
// ItemPaciente
// Cartão da lista de pacientes do profissional (RF306), como no Figma:
// avatar com iniciais, nome, selo "Plataforma" (só para quem tem conta no Dialoga),
// "Desde [mês. de ano]", próxima consulta, selo de status e o ícone de anotação.
// Desktop: "Próxima consulta" aparece à esquerda do status.
// Mobile e Tablet (abaixo de 1024px): sem a próxima consulta (frame mobile do Figma)
// e o nome quebra em mais de uma linha quando falta espaço.
// Props:
//   paciente   -> item de PACIENTES_MOCK (ver pacientesMock.js)
//   onAnotacao -> (paciente) => void, clique no ícone de anotação (opcional nesta etapa)
// ============================================================
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeCheck } from '../../../../components/Icones'
import { doisPrimeirosNomes, formatarDataBR } from '../../../../utils/formatadores'
import { formatarDesde } from './datasPacientes'
import { IconeAnotacao } from './iconesPacientes'
import { statusDe } from './statusPaciente'

// O AvatarIniciais e o Selo compartilhados não mudam; o contêiner só ajusta as
// medidas do Figma (mesmo recurso do AvatarPaciente do Acompanhamento):
// avatar de 44px com iniciais de 14px em negrito
const AJUSTE_AVATAR = 'shrink-0 [&>div]:h-11 [&>div]:w-11 [&>div]:text-[14px] [&>div]:font-bold'
// selo com 20px de altura, texto de 12px e 8px de espaço nas laterais
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-5 [&>span]:gap-0.5 [&>span]:px-2 [&>span]:py-0 [&>span]:text-[12px]'

export default function ItemPaciente({ paciente, onAnotacao }) {
  const status = statusDe(paciente.status)

  return (
    // gap-2 + mr-2 no avatar: 16px entre avatar e nome, e só 8px (mínimo) antes do status,
    // para o nome caber como no Figma mobile ("Mariana / Costa" em 2 linhas)
    <Card as="li" className="flex items-center gap-2 p-[17px]">
      {/* iniciais dos dois primeiros nomes, como no Figma ("João Pedro Alves" -> "JP") */}
      <div className={`mr-2 ${AJUSTE_AVATAR}`}>
        <AvatarIniciais nome={doisPrimeirosNomes(paciente.nome).join(' ')} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-[9px]">
          {/* sem min-w-0: o nome quebra entre as palavras, nunca no meio de uma palavra.
              Celular (abaixo de 640px) com selo "Plataforma": uma palavra por linha numa caixa
              de no mínimo 55px e o selo logo depois, como no Figma mobile ("Ana / Beatriz / Ferreira") */}
          <p
            className={`break-words text-[14px] font-bold leading-5 text-texto ${
              paciente.origem === 'plataforma' ? 'max-sm:w-min max-sm:min-w-[55px]' : ''
            }`}
          >
            {paciente.nome}
          </p>
          {paciente.origem === 'plataforma' && (
            <span className={`${AJUSTE_SELO} [&>span]:pl-1.5`}>
              <Selo tom="primaria">
                <IconeCheck tamanho={10} className="[stroke-width:1.8]" />
                Plataforma
              </Selo>
            </span>
          )}
        </div>
        <p className="text-[12px] leading-4 text-secundaria">Desde {formatarDesde(paciente.desde)}</p>
      </div>

      <div className="flex shrink-0 items-center">
        {/* só no desktop; paciente sem consulta marcada não mostra o bloco (Figma: Mariana Costa) */}
        {paciente.proximaConsulta && (
          <div className="mr-4 hidden text-right lg:block">
            <p className="text-[12px] leading-4 text-secundaria">Próxima consulta</p>
            <p className="text-[12px] font-bold leading-4 text-primaria">{formatarDataBR(paciente.proximaConsulta)}</p>
          </div>
        )}

        <span className={AJUSTE_SELO}>
          <Selo tom={status.tom}>{status.rotulo}</Selo>
        </span>

        {/* TODO: abrir as anotações do paciente (tela de outro card) */}
        <button
          type="button"
          aria-label={`Anotações de ${paciente.nome}`}
          onClick={() => onAnotacao?.(paciente)}
          className="ml-[15px] grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-secundaria transition-colors duration-200 hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeAnotacao />
        </button>
      </div>
    </Card>
  )
}
