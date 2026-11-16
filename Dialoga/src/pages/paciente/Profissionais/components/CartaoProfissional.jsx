// ============================================================
// CartaoProfissional
// Item das seções "Acompanhamento atual" e "Histórico" (RF319), como no Figma:
//   - avatar com as iniciais (48px), nome;
//   - selo verde "Na plataforma" (só quem tem conta no Dialoga) e selo do status (Ativo / Inativo);
//   - especialidade; "Desde [mês] de [ano]" e "Próx. [data]" (só com consulta marcada);
//   - lixeira no canto direito, só no acompanhamento atual (RF326).
// No mobile, os selos descem para baixo do nome quando não cabem e o "Próx." vai para a linha de baixo.
// No tablet o texto tem a mesma largura do mobile (205px), para quebrar igual ao frame mobile.
// O cartão inteiro abre a tela do profissional (/paciente/profissionais/:id); a lixeira fica por cima do link.
// Props:
//   profissional -> { id, nome, especialidade, status, naPlataforma, desde, proximaConsulta }
//   onExcluir(profissional) -> abre o pop-up "Excluir profissional" (sem a prop, a lixeira some)
// ============================================================
import { useId } from 'react'
import { Link } from 'react-router-dom'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Card from '../../../../components/Card'
import { IconeLixeira } from '../../../../components/Icones'
import Selo from '../../../../components/Selo'
import { doisPrimeirosNomes, formatarDataBR, semTitulo } from '../../../../utils/formatadores'
import { AJUSTE_SELO } from './estilosProfissionais'
import { IconeCalendario } from './iconesProfissionais'
import { STATUS_PROFISSIONAL, formatarDesde } from './profissionaisMock'

// avatar de 48px com as iniciais de 14px (o AvatarIniciais compartilhado não muda)
const AJUSTE_AVATAR = 'shrink-0 [&>div]:h-12 [&>div]:w-12 [&>div]:text-[14px]'

// botão quadrado só com ícone (excluir)
const BOTAO_ICONE =
  'relative z-10 mt-px mr-0.5 ml-auto grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg text-secundaria transition-colors duration-200 ' +
  'hover:bg-erro-fundo hover:text-erro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CartaoProfissional({ profissional, onExcluir }) {
  const idTitulo = useId()
  const { nome, especialidade, status, naPlataforma, desde, proximaConsulta } = profissional
  const statusInfo = STATUS_PROFISSIONAL[status] ?? STATUS_PROFISSIONAL.inativo

  return (
    // relative: base do link "esticado"; ao passar o mouse, o fundo fica lilás bem claro
    <Card
      as="article"
      aria-labelledby={idTitulo}
      className="relative flex items-start gap-4 px-5 pt-5 pb-[23px] transition-colors duration-200 hover:bg-fundo-suave-2 lg:pt-[19px] lg:pb-5"
    >
      {/* iniciais dos dois primeiros nomes, sem o título, como no Figma ("Carlos Eduardo Mendes" -> "CE") */}
      <div className={AJUSTE_AVATAR}>
        <AvatarIniciais nome={doisPrimeirosNomes(semTitulo(nome)).join(' ')} />
      </div>

      {/* sm até lg (tablet): mesma largura de texto do mobile */}
      <div className="min-w-0 flex-1 sm:max-lg:max-w-[205px]">
        {/* nome + selos (os selos descem quando não cabem ao lado do nome) */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <h3 id={idTitulo} className="mr-px break-words text-[14px] font-bold leading-5 text-texto">
            {/* link "esticado": o after:absolute cobre o cartão todo (o leitor de tela lê só o nome) */}
            <Link
              to={`/paciente/profissionais/${profissional.id}`}
              className="rounded-sm after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            >
              {nome}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* "Na plataforma" usa um verde mais claro que o do status, como no Figma */}
            {naPlataforma && (
              <span className={`${AJUSTE_SELO} [&>span]:bg-sucesso-alfa-10`}>
                <Selo tom="sucesso">Na plataforma</Selo>
              </span>
            )}
            <span className={AJUSTE_SELO}>
              <Selo tom={statusInfo.tom}>{statusInfo.rotulo}</Selo>
            </span>
          </div>
        </div>

        <p className="mt-px text-[14px] leading-5 text-secundaria">{especialidade}</p>

        {/* início do acompanhamento e próxima consulta */}
        <p className="mt-2 flex flex-wrap items-center gap-x-[13px] gap-y-[11px] text-[12px] leading-4 text-secundaria">
          <span>Desde {formatarDesde(desde)}</span>
          {proximaConsulta && (
            <span className="flex items-center gap-1 font-semibold text-primaria">
              <IconeCalendario tamanho={11} />
              Próx. {formatarDataBR(proximaConsulta)}
            </span>
          )}
        </p>
      </div>

      {/* RF326: lixeira só nos profissionais do acompanhamento atual */}
      {onExcluir && (
        <button type="button" aria-label={`Excluir ${nome}`} onClick={() => onExcluir(profissional)} className={BOTAO_ICONE}>
          <IconeLixeira tamanho={16} className="[stroke-width:1.8]" />
        </button>
      )}
    </Card>
  )
}
