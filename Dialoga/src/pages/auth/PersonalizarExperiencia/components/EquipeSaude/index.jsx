// ============================================================
// EquipeSaude (etapa 2 "Profissional" de Personalizar experiência)
// Estados da tela:
//   tem === null  -> nada escolhido (botão Continuar desabilitado)
//   tem === 'sim' -> mostra a busca e a lista de resultados
//                    (Continuar só libera depois de escolher um profissional)
//   tem === 'nao' -> mostra o aviso "Tudo bem!"
// Estados da busca: texto curto | buscando | erro | nenhum resultado | lista
// Props:
//   valores        -> { tem, busca, profissional }
//   busca          -> retorno do useBuscaProfissional { resultados, carregando, erro, termoCurto, tentarNovamente }
//   erro           -> erro ao criar o vínculo ('' se não houver)
//   vinculando     -> true enquanto envia o vínculo para a API
//   podeContinuar  -> habilita o botão Continuar
//   onEscolherTem            -> ('sim' | 'nao') => void
//   onAlterarBusca           -> (texto) => void
//   onSelecionarProfissional -> (profissional) => void
//   onContinuar / onPular / onVoltar -> navegação entre etapas
// ============================================================
import { useId } from 'react'
import TextField from '../../../../../components/TextField'
import Button from '../../../../../components/Button'
import OpcaoSelecionavel from '../../../../../components/OpcaoSelecionavel'
import CartaoPessoa from '../../../../../components/CartaoPessoa'
import IconeBusca from '../../../../../components/IconeBusca'
import ilustracao from '../../../../../assets/auth/ilustracaoEquipeSaude.png'

// Mensagem pequena de status da busca
function Aviso({ children, tipo = 'status' }) {
  return (
    <p role={tipo} className={`text-[11px] text-center ${tipo === 'alert' ? 'text-erro' : 'text-secundaria'}`}>
      {children}
    </p>
  )
}

// Resultado da busca, de acordo com o estado atual
function ResultadosBusca({ busca, selecionado, onSelecionar }) {
  if (busca.termoCurto) return <Aviso>Digite pelo menos 2 letras para buscar.</Aviso>
  if (busca.carregando) return <Aviso>Buscando profissionais...</Aviso>

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
    <ul className="flex flex-col gap-2" aria-label="Profissionais encontrados">
      {busca.resultados.map((profissional) => (
        <li key={profissional.id}>
          <CartaoPessoa
            nome={profissional.nome_completo}
            detalhe={profissional.especialidades || 'Especialidade não informada'}
            selecionado={selecionado?.id === profissional.id}
            onClick={() => onSelecionar(profissional)}
          />
        </li>
      ))}
    </ul>
  )
}

export default function EquipeSaude({
  valores, busca, erro, vinculando, podeContinuar,
  onEscolherTem, onAlterarBusca, onSelecionarProfissional, onContinuar, onPular, onVoltar,
}) {
  const idPergunta = useId() // liga a pergunta ao grupo de opções (leitor de tela)
  const { tem, profissional } = valores

  // "Nenhum profissional encontrado" só depois que a API respondeu sem resultados
  const semResultados =
    valores.busca.trim().length >= 2 && !busca.carregando && !busca.erro && busca.resultados.length === 0

  return (
    <form className="flex flex-col items-center" onSubmit={onContinuar} noValidate>
      <img className="h-[152px] w-[131px] object-contain" src={ilustracao} width="131" height="152" alt="" />

      <h1 className="mt-4 text-[20px] font-extrabold text-center text-texto">Sua equipe de saúde</h1>
      <p className="mt-2 text-[13px] text-center text-secundaria" id={idPergunta}>
        Você possui acompanhamento profissional?
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mt-5" role="radiogroup" aria-labelledby={idPergunta}>
        <OpcaoSelecionavel selecionado={tem === 'sim'} onClick={() => onEscolherTem('sim')}>
          <span aria-hidden="true">✅</span>
          Sim, tenho
        </OpcaoSelecionavel>
        <OpcaoSelecionavel selecionado={tem === 'nao'} onClick={() => onEscolherTem('nao')}>
          <span aria-hidden="true">❌</span>
          Não por enquanto
        </OpcaoSelecionavel>
      </div>

      {/* Sim, tenho: busca + resultados */}
      {tem === 'sim' && (
        <div className="flex flex-col gap-3 w-full mt-5">
          <TextField
            label="Buscar profissional"
            name="busca"
            autoComplete="off"
            maxLength={100} // mesmo limite do back
            placeholder="Digite o nome ou e-mail do profissional"
            icone={<IconeBusca />}
            value={valores.busca}
            onChange={(e) => onAlterarBusca(e.target.value)}
          />

          {/* aria-live: o leitor de tela avisa quando os resultados mudam */}
          <div aria-live="polite" className="flex flex-col gap-2">
            <ResultadosBusca busca={busca} selecionado={profissional} onSelecionar={onSelecionarProfissional} />

            {semResultados && (
              <Aviso>Nenhum profissional encontrado. Confira o nome ou o e-mail digitado.</Aviso>
            )}

            {/* Dica enquanto ainda não escolheu ninguém da lista */}
            {busca.resultados.length > 0 && !profissional && (
              <Aviso>Toque no profissional para selecioná-lo.</Aviso>
            )}
          </div>
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

      {/* Erro ao criar o vínculo */}
      {erro && (
        <p role="alert" className="w-full mt-4 text-[11px] text-center text-erro">{erro}</p>
      )}

      <div className="w-full mt-6">
        <Button type="submit" disabled={!podeContinuar} carregando={vinculando}>
          {vinculando ? 'Enviando...' : 'Continuar →'}
        </Button>
      </div>

      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline disabled:cursor-not-allowed"
        type="button"
        onClick={onPular}
        disabled={vinculando}
      >
        Pular por enquanto
      </button>
      <button
        className="mt-4 p-0 border-0 bg-transparent text-[12px] text-secundaria cursor-pointer hover:underline disabled:cursor-not-allowed"
        type="button"
        onClick={onVoltar}
        disabled={vinculando}
      >
        ← Voltar
      </button>
    </form>
  )
}
