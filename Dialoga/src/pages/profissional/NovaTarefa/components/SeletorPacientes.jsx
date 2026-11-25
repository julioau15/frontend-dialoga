// ============================================================
// SeletorPacientes
// Campo "Paciente (opcional)" da Nova tarefa (RF277–RF279):
//   - a lista suspensa oferece cada paciente da plataforma e "Todos os pacientes"
//     (pacientes externos, sem conta no app, não podem receber tarefas e ficam de fora);
//   - ao escolher, abre o pop-up "Adicionar prazo?" (Sem prazo / Adicionar prazo);
//   - cada paciente escolhido vira um cartão lilás com as iniciais, o nome,
//     o prazo (quando tiver) e a lixeira para remover
//     (frame "Nova tarefa paciente selecionado - Profissional").
// Props:
//   pacientes    -> pacientes que podem receber tarefa (vínculo aceito e ativos): [{ id, nome }]
//   carregando   -> true enquanto a lista de pacientes é buscada na API
//   erroLista    -> mensagem se a lista de pacientes não carregou
//   selecionados -> [{ id, nome, comPrazo, prazo: 'AAAA-MM-DD' | '' }]
//   onMudar      -> recebe a nova lista de selecionados
//   erro         -> mensagem de erro do campo (ex.: nenhum paciente no envio)
// ============================================================
import { useId, useState } from 'react'
import { IconeLixeira } from '../../../../components/Icones'
import { formatarDataBR } from '../../../../utils/formatadores'
import BotaoIcone from './BotaoIcone'
import { Rotulo } from './campos'
import { CAIXA } from './estilos'
import { IconeChevronBaixo } from './iconesNovaTarefa'
import ModalPrazo from './ModalPrazo'

// "Ana Beatriz Ferreira" -> "AB"
function iniciais(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

export default function SeletorPacientes({ pacientes = [], carregando = false, erroLista = '', selecionados, onMudar, erro }) {
  const idCampo = useId()
  // escolha aguardando o pop-up de prazo: 'todos' ou o id do paciente (null = fechado)
  const [pendente, setPendente] = useState(null)
  // só oferece na lista quem ainda não foi escolhido; pacientes externos (sem conta no app)
  // não aparecem, porque não podem receber nem responder tarefas
  const disponiveis = pacientes.filter((p) => !selecionados.some((s) => s.id === p.id))
  const novos = pendente === 'todos' ? disponiveis : disponiveis.filter((p) => String(p.id) === pendente)

  // adiciona o(s) paciente(s) escolhido(s) com ou sem prazo e fecha o pop-up
  function adicionar(prazo) {
    onMudar([...selecionados, ...novos.map((p) => ({ ...p, comPrazo: Boolean(prazo), prazo: prazo ?? '' }))])
    setPendente(null)
  }

  const remover = (id) => onMudar(selecionados.filter((s) => s.id !== id))

  return (
    <div className="flex flex-col gap-2">
      <Rotulo htmlFor={idCampo} opcional>Paciente</Rotulo>
      {/* setinha fina do Figma no lugar da seta padrão do navegador (appearance-none) */}
      <div className="relative">
        {/* value fixo em "": a lista sempre volta para "Selecionar paciente..." depois da escolha */}
        <select
          id={idCampo}
          value=""
          disabled={carregando || disponiveis.length === 0}
          aria-invalid={!!erro}
          onChange={(e) => setPendente(e.target.value)}
          className={`${CAIXA} h-[46px] cursor-pointer appearance-none pr-11 pl-5 disabled:cursor-not-allowed disabled:text-secundaria ${erro ? 'border-erro' : 'border-borda'}`}
        >
          <option value="" disabled>
            {carregando
              ? 'Carregando pacientes...'
              : disponiveis.length
                ? 'Selecionar paciente...'
                : pacientes.length
                  ? 'Todos os pacientes já foram selecionados'
                  : 'Nenhum paciente disponível'}
          </option>
          {disponiveis.length > 1 && <option value="todos">Todos os pacientes</option>}
          {disponiveis.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <IconeChevronBaixo tamanho={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-texto" />
      </div>
      {erro && <span className="text-[11px] text-erro-texto">{erro}</span>}
      {erroLista && <span role="alert" className="text-[11px] text-erro-texto">{erroLista}</span>}

      {selecionados.length > 0 && (
        <ul aria-label="Pacientes selecionados" className="mt-0.5 flex flex-col gap-2">
          {selecionados.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-borda-forte bg-fundo-card py-3 pr-3 pl-3">
              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primaria text-[11px] font-bold text-branco">
                {iniciais(p.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-texto">{p.nome}</p>
                {p.comPrazo && p.prazo && <p className="text-[11px] text-secundaria">Prazo: {formatarDataBR(p.prazo)}</p>}
              </div>
              <BotaoIcone rotulo={`Remover ${p.nome}`} perigo onClick={() => remover(p.id)}>
                <IconeLixeira tamanho={14} />
              </BotaoIcone>
            </li>
          ))}
        </ul>
      )}

      {pendente !== null && novos.length > 0 && (
        <ModalPrazo
          nome={pendente === 'todos' ? 'todos os pacientes' : novos[0].nome}
          onSemPrazo={() => adicionar(null)}
          onAdicionar={(data) => adicionar(data)}
          onFechar={() => setPendente(null)}
        />
      )}
    </div>
  )
}
