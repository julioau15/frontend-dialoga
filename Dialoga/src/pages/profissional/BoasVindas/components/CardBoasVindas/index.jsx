// ============================================================
// CardBoasVindas (card de boas-vindas do profissional)
// Só desenha: ilustração, saudação, pergunta com 2 opções e botão de acesso.
// Estados da tela:
//   escolha === null        -> nada escolhido
//   escolha === 'vincular'  -> mostra a busca de paciente e a lista de resultados
//   escolha === 'depois'    -> mostra o aviso "Tudo bem!"
// Estados da busca: texto curto | buscando | erro | nenhum resultado | lista
// Props:
//   nome               -> primeiro nome mostrado na saudação ('' enquanto o perfil carrega)
//   escolha            -> 'vincular' | 'depois' | null
//   busca              -> texto digitado na busca de paciente
//   resultados         -> retorno do useBuscaPaciente { resultados, carregando, erro, termoCurto, tentarNovamente }
//   paciente           -> paciente escolhido na lista (deixa o cartão verde com ✓) ou null
//   erro               -> aviso de validação ('' se não houver)
//   enviando           -> true enquanto envia para a API
//   travado            -> true depois que o paciente foi notificado (escolha e busca não mudam mais)
//   onEscolher         -> ('vincular' | 'depois') => void
//   onAlterarBusca     -> (texto) => void
//   onSelecionarPaciente -> (paciente) => void
//   onAcessar          -> chamado ao clicar em "Acessar o Dialoga"
// ============================================================
import { useId } from 'react'
import Button from '../../../../../components/Button'
import TextField from '../../../../../components/TextField'
import OpcaoSelecionavel from '../../../../../components/OpcaoSelecionavel'
import CartaoPessoa from '../../../../../components/CartaoPessoa'
import IconeBusca from '../../../../../components/IconeBusca'
import ilustracao from '../../../../../assets/auth/ilustracaoBoasVindasProfissional.png'

// Mensagem pequena de status da busca
function Aviso({ children, tipo = 'status' }) {
  return (
    <p role={tipo} className={`text-[11px] text-center ${tipo === 'alert' ? 'text-erro' : 'text-secundaria'}`}>
      {children}
    </p>
  )
}

// Texto abaixo do nome: e-mail, mais um aviso quando já existe solicitação ou acompanhamento
function detalhePaciente(paciente) {
  if (paciente.situacao_vinculo === 'pendente') return `${paciente.email} · Solicitação já enviada`
  if (paciente.situacao_vinculo === 'ativo') return `${paciente.email} · Já é seu paciente`
  return paciente.email
}

// Resultado da busca, de acordo com o estado atual
function ResultadosBusca({ busca, selecionado, travado, onSelecionar }) {
  if (busca.termoCurto) return <Aviso>Digite pelo menos 2 letras para buscar.</Aviso>
  if (busca.carregando) return <Aviso>Buscando pacientes...</Aviso>

  if (busca.erro) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Aviso tipo="alert">{busca.erro}</Aviso>
        <button type="button" className="text-[11px] text-primaria underline cursor-pointer" onClick={busca.tentarNovamente}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // Ainda não digitou nada: não mostra nada
  if (busca.resultados.length === 0) return null

  return (
    <ul className="flex flex-col gap-2" aria-label="Pacientes encontrados">
      {busca.resultados.map((paciente) => (
        <li key={paciente.id}>
          <CartaoPessoa
            nome={paciente.nome_completo}
            detalhe={detalhePaciente(paciente)}
            selecionado={selecionado?.id === paciente.id}
            disabled={travado || Boolean(paciente.situacao_vinculo)}
            onClick={() => onSelecionar(paciente)}
          />
        </li>
      ))}
    </ul>
  )
}

export default function CardBoasVindas({
  nome, escolha, busca, resultados, paciente, erro, enviando, travado,
  onEscolher, onAlterarBusca, onSelecionarPaciente, onAcessar,
}) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)

  // "Nenhum paciente encontrado" só depois que a API respondeu sem resultados
  const semResultados =
    busca.trim().length >= 2 && !resultados.carregando && !resultados.erro && resultados.resultados.length === 0

  // Dica enquanto ainda não escolheu ninguém (e há alguém disponível para escolher)
  const haDisponivel = resultados.resultados.some((p) => !p.situacao_vinculo)

  return (
    <div className="flex flex-col items-center text-center">
      <img className="h-auto max-w-full" src={ilustracao} width="260" height="165" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-texto">
        Bem-vindo ao Dialoga{nome ? `, ${nome}` : ''}! <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-2 max-w-[340px] text-[13px] text-secundaria">
        Aqui você acompanha seus pacientes, cria tarefas e gerencia sua agenda — tudo em um só lugar.
      </p>

      <p className="mt-7 text-[13px] font-bold text-texto" id={idPergunta}>
        Você deseja informar um paciente agora?
      </p>

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 w-full mt-4" role="radiogroup" aria-labelledby={idPergunta}>
        <OpcaoSelecionavel selecionado={escolha === 'vincular'} disabled={travado} onClick={() => onEscolher('vincular')}>
          <span aria-hidden="true">✅</span>
          Sim, quero vincular
        </OpcaoSelecionavel>
        <OpcaoSelecionavel selecionado={escolha === 'depois'} disabled={travado} onClick={() => onEscolher('depois')}>
          <span aria-hidden="true">⏭️</span>
          Fazer depois
        </OpcaoSelecionavel>
      </div>

      {/* Sim, quero vincular: busca + resultados */}
      {escolha === 'vincular' && (
        <div className="flex flex-col gap-3 w-full mt-5">
          <TextField
            label="Buscar paciente pelo nome ou e-mail"
            name="busca"
            autoComplete="off"
            maxLength={100} // mesmo limite do back
            placeholder="Nome ou e-mail do paciente"
            icone={<IconeBusca />}
            value={busca}
            disabled={travado}
            onChange={(e) => onAlterarBusca(e.target.value)}
          />

          {/* aria-live: o leitor de tela avisa quando os resultados mudam */}
          <div aria-live="polite" className="flex flex-col gap-2">
            <ResultadosBusca busca={resultados} selecionado={paciente} travado={travado} onSelecionar={onSelecionarPaciente} />

            {semResultados && <Aviso>Nenhum paciente encontrado. Confira o nome ou o e-mail digitado.</Aviso>}

            {haDisponivel && !paciente && <Aviso>Toque no paciente para selecioná-lo.</Aviso>}
          </div>
        </div>
      )}

      {/* Fazer depois: aviso */}
      {escolha === 'depois' && (
        <p className="w-full mt-5 p-3 bg-fundo-card border border-borda rounded-[10px] text-[11px] text-texto" role="status">
          Tudo bem! Você pode vincular pacientes a qualquer momento pelo menu <strong className="font-bold">Pacientes</strong>.
        </p>
      )}

      {/* Aviso de validação (ex.: escolheu vincular, mas não selecionou ninguém) */}
      {erro && <p role="alert" className="w-full mt-4 text-[11px] text-center text-erro">{erro}</p>}

      <div className={`w-full ${escolha === null ? 'mt-10' : 'mt-6'}`}>
        <Button type="button" carregando={enviando} onClick={onAcessar}>
          {enviando ? 'Enviando...' : 'Acessar o Dialoga →'}
        </Button>
      </div>
    </div>
  )
}
