// ============================================================
// BoasVindas (card de boas-vindas do profissional)
// Só layout: ilustração, saudação, pergunta com 2 opções e botão de acesso.
// Props:
//   nome       -> nome mostrado na saudação
//   escolha    -> 'vincular' | 'depois' | null (opção marcada)
//   onEscolher -> (escolha) => void
//   onAcessar  -> chamado ao clicar em "Acessar o Dialoga"
// ============================================================
import { useId } from 'react'
import Button from '../../../../../components/Button'
import OpcaoSelecionavel from '../../../../../components/OpcaoSelecionavel'
import ilustracao from '../../../../../assets/auth/ilustracaoBoasVindasProfissional.png'

export default function BoasVindas({ nome, escolha, onEscolher, onAcessar }) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)

  return (
    <div className="flex flex-col items-center text-center">
      <img className="ilustracao-tema h-auto max-w-full" src={ilustracao} width="260" height="165" alt="" />

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

      <div className="w-full mt-10">
        <Button type="button" onClick={onAcessar}>Acessar o Dialoga →</Button>
      </div>
    </div>
  )
}
