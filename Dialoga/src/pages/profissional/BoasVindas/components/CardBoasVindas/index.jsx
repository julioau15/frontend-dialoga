// ============================================================
// CardBoasVindas (card de boas-vindas do profissional)
// Só layout: ilustração, saudação, pergunta com 2 opções e botão de acesso.
// Estados da tela:
//   escolha === null        -> nada escolhido
//   escolha === 'vincular'  -> mostra a busca de paciente e a lista de resultados
//   escolha === 'depois'    -> mostra o aviso "Tudo bem!"
// Estados da busca: texto curto | buscando | erro | nenhum resultado | lista
// Props:
//   nome            -> primeiro nome mostrado na saudação ('' = saudação sem nome)
//   escolha         -> 'vincular' | 'depois' | null
//   busca           -> texto digitado na busca de paciente
//   resultadoBusca  -> retorno do useBuscaPaciente { resultados, carregando, erro, termoCurto, tentarNovamente }
//   vinculados      -> pacientes já vinculados: [{ id }] (o cartão fica verde com ✓)
//   vinculandoId    -> id do paciente que está sendo enviado (desabilita a lista)
//   erroVinculo     -> erro ao criar o vínculo ('' se não houver)
//   acessando       -> true enquanto conclui o primeiro acesso na API
//   erroAcesso      -> erro ao concluir o primeiro acesso ('' se não houver)
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

// Resultado da busca, de acordo com o estado atual
function ResultadosBusca({ resultadoBusca, vinculados, vinculandoId, onSelecionar }) {
  if (resultadoBusca.termoCurto) return <Aviso>Digite pelo menos 2 letras para buscar.</Aviso>
  if (resultadoBusca.carregando) return <Aviso>Buscando pacientes...</Aviso>

  if (resultadoBusca.erro) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Aviso tipo="alert">{resultadoBusca.erro}</Aviso>
        <button type="button" className="text-[11px] text-primaria underline cursor-pointer" onClick={resultadoBusca.tentarNovamente}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // Ainda não digitou nada: não mostra nada
  if (resultadoBusca.resultados.length === 0) return null

  return (
    <ul className="flex flex-col gap-2" aria-label="Pacientes encontrados">
      {resultadoBusca.resultados.map((paciente) => (
        <li key={paciente.id}>
          <CartaoPessoa
            nome={paciente.nome_completo}
            detalhe={paciente.email}
            selecionado={vinculados.some((v) => v.id === paciente.id)}
            disabled={vinculandoId !== null} // evita enviar dois vínculos ao mesmo tempo
            onClick={() => onSelecionar(paciente)}
          />
        </li>
      ))}
    </ul>
  )
}

export default function CardBoasVindas({
  nome, escolha, busca, resultadoBusca, vinculados, vinculandoId, erroVinculo, acessando, erroAcesso,
  onEscolher, onAlterarBusca, onSelecionarPaciente, onAcessar,
}) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)

  // "Nenhum paciente encontrado" só depois que a API respondeu sem resultados
  const semResultados =
    busca.trim().length >= 2 && !resultadoBusca.carregando && !resultadoBusca.erro && resultadoBusca.resultados.length === 0

  return (
    <div className="flex flex-col items-center text-center">
      <img className="h-auto max-w-full" src={ilustracao} width="260" height="165" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-texto">
        Bem-vindo ao Dialoga{nome && `, ${nome}`}! <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-2 max-w-[340px] text-[13px] text-secundaria">
        Aqui você acompanha seus pacientes, cria tarefas e gerencia sua agenda — tudo em um só lugar.
      </p>

      <p className="mt-7 text-[13px] font-bold text-texto" id={idPergunta}>
        Você deseja informar um paciente agora?
      </p>

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 w-full mt-4" role="radiogroup" aria-labelledby={idPergunta}>
        <OpcaoSelecionavel selecionado={escolha === 'vincular'} onClick={() => onEscolher('vincular')} disabled={acessando}>
          <span aria-hidden="true">✅</span>
          Sim, quero vincular
        </OpcaoSelecionavel>
        <OpcaoSelecionavel selecionado={escolha === 'depois'} onClick={() => onEscolher('depois')} disabled={acessando}>
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
            maxLength={100}
            placeholder="Nome ou e-mail do paciente"
            icone={<IconeBusca />}
            value={busca}
            onChange={(e) => onAlterarBusca(e.target.value)}
          />

          {/* aria-live: o leitor de tela avisa quando os resultados mudam */}
          <div aria-live="polite" className="flex flex-col gap-2">
            <ResultadosBusca
              resultadoBusca={resultadoBusca}
              vinculados={vinculados}
              vinculandoId={vinculandoId}
              onSelecionar={onSelecionarPaciente}
            />

            {vinculandoId !== null && <Aviso>Enviando solicitação...</Aviso>}

            {semResultados && <Aviso>Nenhum paciente encontrado. Confira o nome ou o e-mail digitado.</Aviso>}
          </div>

          {/* Erro ao criar o vínculo */}
          {erroVinculo && <Aviso tipo="alert">{erroVinculo}</Aviso>}
        </div>
      )}

      {/* Fazer depois: aviso */}
      {escolha === 'depois' && (
        <p className="w-full mt-5 p-3 bg-fundo-card border border-borda rounded-[10px] text-[11px] text-texto" role="status">
          Tudo bem! Você pode vincular pacientes a qualquer momento pelo menu <strong className="font-bold">Pacientes</strong>.
        </p>
      )}

      {/* Erro ao concluir o primeiro acesso */}
      {erroAcesso && (
        <p role="alert" className="w-full mt-4 text-[11px] text-center text-erro">{erroAcesso}</p>
      )}

      <div className={`w-full ${escolha === null ? 'mt-10' : 'mt-6'}`}>
        <Button type="button" onClick={onAcessar} carregando={acessando} disabled={vinculandoId !== null}>
          {acessando ? 'Entrando...' : 'Acessar o Dialoga →'}
        </Button>
      </div>
    </div>
  )
}
