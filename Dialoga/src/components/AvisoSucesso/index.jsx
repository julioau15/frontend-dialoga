// ============================================================
// components/AvisoSucesso
// Faixa verde com ícone de check, mostrada no topo do formulário
// depois de salvar (ex.: "Alterações salvas com sucesso!").
// Usada nas telas de Perfil do paciente e do admin.
// Props:
//   children -> texto do aviso (padrão: "Alterações salvas com sucesso!")
// ============================================================
import { IconeCheck } from '../Icones'

export default function AvisoSucesso({ children = 'Alterações salvas com sucesso!' }) {
  return (
    // text-sucesso-escura: o verde padrão sobre o fundo claro não passa no contraste AA
    <div role="status" className="flex items-center gap-2 min-h-10 px-3 py-2 rounded-lg border border-sucesso-borda-suave bg-sucesso-fundo text-[12px] text-sucesso-escura">
      <IconeCheck tamanho={13} className="shrink-0" />
      {children}
    </div>
  )
}
