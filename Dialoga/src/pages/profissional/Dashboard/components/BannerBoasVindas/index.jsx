// ============================================================
// Dashboard/components/BannerBoasVindas
// Faixa roxa do topo: data de hoje, saudação e resumo dos atendimentos.
// Props:
//   data     -> Date de hoje
//   nome     -> primeiro nome do profissional (pode vir vazio enquanto carrega)
//   mensagem -> frase abaixo da saudação
// ============================================================
import { formatarDataExtenso } from '../../../../../utils/formatadores'

export default function BannerBoasVindas({ data, nome, mensagem }) {
  return (
    <header className="rounded-2xl bg-linear-to-b from-primaria to-[#6B4891] px-6 py-6 text-branco shadow-md">
      {/* "capitalize" deixa cada palavra com inicial maiúscula, como no layout */}
      <p className="text-sm capitalize text-branco-alfa-80">{formatarDataExtenso(data)}</p>
      <h1 className="mt-1 text-2xl font-bold">
        {nome ? `Olá, ${nome}!` : 'Olá!'} <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-1 text-sm text-branco-alfa-90">{mensagem}</p>
    </header>
  )
}
