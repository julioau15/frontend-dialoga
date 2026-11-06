// ============================================================
// CartaoAdministrador
// Um item da lista de administradores: avatar com iniciais, nome
// (com a etiqueta "Você" no meu próprio cartão), e-mail, quem criou
// e quando, e a lixeira nos outros administradores.
// Props:
//   administrador -> { nome, email, criadoPor, criadoEm, voce }
//   onRemover     -> (administrador) => void, chamado ao clicar na lixeira
//   podeRemover   -> true mostra a lixeira (false no cartão do administrador logado, RN03)
// ============================================================
import AvatarIniciais from '../../../../../components/AvatarIniciais'
import Card from '../../../../../components/Card'
import Selo from '../../../../../components/Selo'
import { IconeLixeira } from '../../../../../components/Icones'
import { formatarData } from '../../../../../utils/formatadores'

export default function CartaoAdministrador({ administrador, podeRemover, onRemover }) {
  const { nome, email, criadoPor, criadoEm, voce } = administrador
  const dataCriacao = formatarData(criadoEm)

  return (
    // Reaproveito o Card como <li>, porque o cartão fica dentro de uma lista <ul>
    <Card as="li" className="flex items-center gap-4 p-4">
      <AvatarIniciais nome={nome} />

      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <p className="flex items-center gap-2 text-[13px] font-bold text-texto">
          {nome}
          {voce && <Selo tom="primaria">Você</Selo>}
        </p>
        {/* truncate: um e-mail muito longo não empurra a lixeira para fora do cartão */}
        <p className="text-[11px] text-secundaria truncate">{email}</p>
        {/* Sem "criadoPor", exibe só a data; sem data, a linha não aparece */}
        {dataCriacao && (
          <p className="text-[11px] text-secundaria">
            {criadoPor ? `Criado por ${criadoPor} · ${dataCriacao}` : `Criado em ${dataCriacao}`}
          </p>
        )}
      </div>

      {/* O administrador não pode remover a própria conta, então não mostro a lixeira no cartão dele */}
      {/* Agora a regra vem do hook useAdministradores */}
      {podeRemover && (
        <button
          type="button"
          onClick={() => onRemover(administrador)}
          aria-label={`Remover ${nome}`}
          className="grid place-items-center w-8 h-8 shrink-0 rounded-md border-0 bg-transparent text-secundaria cursor-pointer transition-[background,color] duration-200 ease-[ease] hover:bg-erro-fundo hover:text-erro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeLixeira tamanho={16} />
        </button>
      )}
    </Card>
  )
}