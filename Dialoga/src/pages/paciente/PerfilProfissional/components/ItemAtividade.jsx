// ============================================================
// ItemAtividade
// Item das listas "Tarefas ativas" e "Tratamentos vinculados" da tela do profissional,
// como no Figma: caixa lilás clara com o ícone verde num círculo de 40px, título, status em verde,
// descrição e, à direita, o rótulo em maiúsculas ("PRAZO" / "FREQUÊNCIA") com o valor.
// Os dois cartões do Figma têm diferenças, reproduzidas pela prop "tituloInteiro":
//   - Tarefas: o prazo fica centralizado ao lado do título, do status e da descrição;
//   - Tratamentos (tituloInteiro): o título ocupa a largura toda e o prazo/frequência fica
//     ao lado só do status e da descrição, com menos respiro em cima e embaixo.
// Mobile (até 639px): ícone menor (32px), menos respiro e o prazo/frequência vai para baixo
// da descrição, numa linha só ("PRAZO 15/09"), para o texto usar a largura toda do item.
// Props:
//   item          -> { titulo, status, descricao, rotulo, valor }
//   icone         -> elemento do ícone (ex.: <IconeCirculoCheck tamanho={22} />)
//   tituloInteiro -> true no cartão "Tratamentos vinculados"
// ============================================================

// rótulo em maiúsculas e valor, alinhados à direita (escondido no mobile)
function Prazo({ item }) {
  return (
    <p className="hidden shrink-0 text-right sm:block">
      <span className="block text-[11px] font-bold uppercase leading-4 text-secundaria">{item.rotulo}</span>
      <span className="mt-1 block text-[14px] font-bold leading-5 text-texto">{item.valor}</span>
    </p>
  )
}

// mobile: rótulo e valor na mesma linha, embaixo da descrição
function PrazoMobile({ item }) {
  return (
    <p className="mt-1.5 flex items-baseline gap-1.5 sm:hidden">
      <span className="text-[11px] font-bold uppercase leading-4 text-secundaria">{item.rotulo}</span>
      <span className="text-[13px] font-bold leading-[18px] text-texto">{item.valor}</span>
    </p>
  )
}

// status em verde (cor do Figma) e descrição
function StatusDescricao({ item }) {
  return (
    <>
      <p className="mt-0.5 text-[12px] font-semibold leading-4 text-sucesso sm:text-[13px] sm:leading-[18px]">{item.status}</p>
      <p className="mt-0.5 text-[12px] leading-4 text-secundaria sm:text-[13px] sm:leading-[18px]">{item.descricao}</p>
    </>
  )
}

export default function ItemAtividade({ item, icone, tituloInteiro = false }) {
  const titulo = (
    <h4 className="break-words text-[14px] font-bold leading-[18px] text-texto sm:text-[15px] sm:leading-5">{item.titulo}</h4>
  )

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-borda bg-fundo-suave-2 py-3 pr-3 pl-3 sm:gap-4 sm:pr-4 sm:pl-[15px] ${
        // no desktop os itens de Tratamentos têm 111px no mínimo, com o conteúdo centralizado (Figma)
        tituloInteiro ? 'sm:pt-[7px] sm:pb-2 xl:min-h-[111px]' : 'sm:pt-[15px] sm:pb-4'
      }`}
    >
      {/* no mobile o círculo tem 32px e o ícone 18px */}
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-full bg-sucesso-fundo text-sucesso max-sm:[&_svg]:h-[18px] max-sm:[&_svg]:w-[18px] sm:h-10 sm:w-10 sm:self-center"
      >
        {icone}
      </span>

      {tituloInteiro ? (
        // título na largura toda; prazo/frequência ao lado do status e da descrição
        <div className="min-w-0 flex-1">
          {titulo}
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <StatusDescricao item={item} />
              <PrazoMobile item={item} />
            </div>
            <Prazo item={item} />
          </div>
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            {titulo}
            <StatusDescricao item={item} />
            <PrazoMobile item={item} />
          </div>
          <Prazo item={item} />
        </>
      )}
    </li>
  )
}
