// ============================================================
// CampoPaciente
// Caixa de texto da tela Pacientes, nas medidas do Figma: fundo branco,
// cantos de 12px, contorno lilás de 1px por FORA da caixa (feito com sombra,
// como o "stroke outside" do Figma, para não mudar o tamanho do campo),
// texto e placeholder de 14px e a lupa (IconeBusca) opcional à esquerda.
// Usado na busca da lista (RF300) e nos campos do pop-up "Adicionar paciente".
// O TextField compartilhado não foi usado porque tem outra altura, outro
// tamanho de texto e outra cor de placeholder.
// Props:
//   rotulo     -> nome do campo para leitores de tela (o texto visível fica fora)
//   comLupa    -> true mostra a lupa à esquerda
//   className  -> classes da caixa (altura e espaçamentos, que mudam por tela)
//   inputRef   -> ref do <input> (para dar foco a partir do pop-up)
//   acao       -> elemento à direita do texto (opcional; ex.: ✓ de paciente escolhido)
//   ...resto (value, onChange, placeholder, id...) vai direto no <input>
// ============================================================
import IconeBusca from '../../../../components/IconeBusca'

export default function CampoPaciente({ rotulo, comLupa = false, className = '', inputRef, acao, ...inputProps }) {
  return (
    <div
      className={`flex items-center rounded-xl bg-superficie shadow-[0_0_0_1px_var(--color-borda)] transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_var(--color-primaria),0_0_0_4px_var(--color-primaria-alfa-20)] ${className}`}
    >
      {comLupa && <IconeBusca />}
      {/* sem o "x" nativo do type="search": não existe no Figma e ocupava espaço do placeholder */}
      <input
        ref={inputRef}
        aria-label={rotulo}
        autoComplete="off"
        className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] text-texto text-ellipsis outline-0 placeholder:text-secundaria [&::-webkit-search-cancel-button]:hidden"
        {...inputProps}
      />
      {acao}
    </div>
  )
}
