// ============================================================
// EquipeSaude (etapa 2 "Profissional" de Personalizar experiência)
// Só layout. Estados da tela:
//   tem === null    -> nada escolhido (botão Continuar desabilitado)
//   tem === 'sim'   -> mostra a busca; ao digitar aparece o resultado
//   tem === 'nao'   -> mostra o aviso "Tudo bem!"
// Props:
//   valores        -> { tem, busca, selecionado }
//   profissional   -> { nome, especialidade } do resultado da busca
//   podeContinuar  -> habilita o botão Continuar
//   onAlterarCampo -> (campo, valor) => void
//   onAbrirModal   -> chamado ao clicar no resultado da busca
//   onContinuar / onPular / onVoltar -> navegação entre etapas
// ============================================================
import { useId } from 'react'
import TextField from '../../../../../components/TextField'
import Button from '../../../../../components/Button'
import OpcaoSelecionavel from '../../../../../components/OpcaoSelecionavel'
import CartaoPessoa from '../../../../../components/CartaoPessoa'
import IconeBusca from '../../../../../components/IconeBusca'
import ilustracao from '../../../../../assets/auth/ilustracaoEquipeSaude.png'

export default function EquipeSaude({
  valores, profissional, podeContinuar, onAlterarCampo, onAbrirModal, onContinuar, onPular, onVoltar,
}) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)
  const { tem, busca, selecionado } = valores

  return (
    <form className="flex flex-col items-center" onSubmit={onContinuar} noValidate>
      <img className="h-[152px] w-[131px] object-contain" src={ilustracao} width="131" height="152" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-center text-texto">Sua equipe de saúde</h1>
      <p className="mt-2 text-[13px] text-center text-secundaria" id={idPergunta}>
        Você possui acompanhamento profissional?
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mt-5" role="radiogroup" aria-labelledby={idPergunta}>
        <OpcaoSelecionavel selecionado={tem === 'sim'} onClick={() => onAlterarCampo('tem', 'sim')}>
          <span aria-hidden="true">✅</span>
          Sim, tenho
        </OpcaoSelecionavel>
        <OpcaoSelecionavel selecionado={tem === 'nao'} onClick={() => onAlterarCampo('tem', 'nao')}>
          <span aria-hidden="true">❌</span>
          Não por enquanto
        </OpcaoSelecionavel>
      </div>

      {/* Sim, tenho: busca + resultado */}
      {tem === 'sim' && (
        <div className="flex flex-col gap-3 w-full mt-5">
          <TextField
            label="Buscar profissional"
            name="busca"
            autoComplete="off"
            placeholder="Digite o nome ou e-mail do profissional"
            icone={<IconeBusca />}
            value={busca}
            onChange={(e) => onAlterarCampo('busca', e.target.value)}
          />
          {busca.trim() !== '' && (
            <CartaoPessoa
              nome={profissional.nome}
              detalhe={profissional.especialidade}
              selecionado={selecionado}
              onClick={onAbrirModal}
            />
          )}
        </div>
      )}

      {/* Não por enquanto: aviso */}
      {tem === 'nao' && (
        <div className="w-full mt-5 p-3 text-center bg-erro-fundo-2 border border-erro-borda rounded-[10px]" role="status">
          <p className="text-[12px] font-bold text-texto">Tudo bem! <span aria-hidden="true">💜</span></p>
          <p className="mt-1 text-[11px] text-texto">
            Você pode adicionar um profissional a qualquer momento nos seus <strong className="font-bold">Profissionais</strong>.
          </p>
        </div>
      )}

      <div className="w-full mt-6">
        <Button type="submit" disabled={!podeContinuar}>Continuar →</Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onPular}
      >
        Pular por enquanto
      </button>
      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline"
        type="button"
        onClick={onVoltar}
      >
        ← Voltar
      </button>
    </form>
  )
}
