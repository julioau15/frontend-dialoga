// ============================================================
// CardBoasVindas (card de boas-vindas do profissional)
// Só layout: ilustração, saudação, pergunta com 2 opções e botão de acesso.
// Estados da tela:
//   escolha === null        -> nada escolhido
//   escolha === 'vincular'  -> mostra a busca de paciente; ao digitar aparece o resultado
//   escolha === 'depois'    -> mostra o aviso "Tudo bem!"
// Props:
//   nome           -> nome mostrado na saudação
//   escolha        -> 'vincular' | 'depois' | null
//   busca          -> texto digitado na busca de paciente
//   paciente       -> { nome, email } do resultado da busca
//   selecionado    -> true deixa o cartão do paciente verde com ✓
//   onEscolher     -> (escolha) => void
//   onAlterarBusca -> (texto) => void
//   onAbrirModal   -> chamado ao clicar no resultado da busca
//   onAcessar      -> chamado ao clicar em "Acessar o Dialoga"
// ============================================================
import { useId } from 'react'
import Button from '../../../../../components/Button'
import TextField from '../../../../../components/TextField'
import OpcaoSelecionavel from '../../../../../components/OpcaoSelecionavel'
import CartaoPessoa from '../../../../../components/CartaoPessoa'
import IconeBusca from '../../../../../components/IconeBusca'
import ilustracao from '../../../../../assets/auth/ilustracaoBoasVindasProfissional.png'

export default function CardBoasVindas({
  nome, escolha, busca, paciente, selecionado, onEscolher, onAlterarBusca, onAbrirModal, onAcessar,
}) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)

  return (
    <div className="flex flex-col items-center text-center">
      <img className="h-auto max-w-full" src={ilustracao} width="260" height="165" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-texto">
        Bem-vindo ao Dialoga, {nome}! <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-2 max-w-[340px] text-[13px] text-secundaria">
        Aqui você acompanha seus pacientes, cria tarefas e gerencia sua agenda — tudo em um só lugar.
      </p>

      <p className="mt-7 text-[13px] font-bold text-texto" id={idPergunta}>
        Você deseja informar um paciente agora?
      </p>

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 w-full mt-4" role="radiogroup" aria-labelledby={idPergunta}>
        <OpcaoSelecionavel selecionado={escolha === 'vincular'} onClick={() => onEscolher('vincular')}>
          <span aria-hidden="true">✅</span>
          Sim, quero vincular
        </OpcaoSelecionavel>
        <OpcaoSelecionavel selecionado={escolha === 'depois'} onClick={() => onEscolher('depois')}>
          <span aria-hidden="true">⏭️</span>
          Fazer depois
        </OpcaoSelecionavel>
      </div>

      {/* Sim, quero vincular: busca + resultado */}
      {escolha === 'vincular' && (
        <div className="flex flex-col gap-3 w-full mt-5">
          <TextField
            label="Buscar paciente pelo nome ou e-mail"
            name="busca"
            autoComplete="off"
            placeholder="Nome ou e-mail do paciente"
            icone={<IconeBusca />}
            value={busca}
            onChange={(e) => onAlterarBusca(e.target.value)}
          />
          {busca.trim() !== '' && (
            <CartaoPessoa
              nome={paciente.nome}
              detalhe={paciente.email}
              selecionado={selecionado}
              onClick={onAbrirModal}
            />
          )}
        </div>
      )}

      {/* Fazer depois: aviso */}
      {escolha === 'depois' && (
        <p className="w-full mt-5 p-3 bg-fundo-card border border-borda rounded-[10px] text-[11px] text-texto" role="status">
          Tudo bem! Você pode vincular pacientes a qualquer momento pelo menu <strong className="font-bold">Pacientes</strong>.
        </p>
      )}

      <div className={`w-full ${escolha === null ? 'mt-10' : 'mt-6'}`}>
        <Button type="button" onClick={onAcessar}>Acessar o Dialoga →</Button>
      </div>
    </div>
  )
}
