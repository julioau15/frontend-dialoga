// ============================================================
// pages/auth/PersonalizarExperiencia
// Personalização do paciente em 3 etapas (só o layout, sem API ainda):
//   1) DadosPessoais  -> como quer ser chamado e data de nascimento (opcionais)
//   2) Profissional   -> (tela ainda não feita)
//   3) Humor          -> (tela ainda não feita)
// Rota: /personalizar-experiencia
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { concluirPrimeiroAcesso } from '../../../utils/primeiroAcesso'
import Stepper from '../../../components/Stepper'
import PontosProgresso from '../../../components/PontosProgresso'
import DadosPessoais from './components/DadosPessoais'
import { usePersonalizarExperiencia } from '../../../hooks/usePersonalizarExperiencia'

const PASSOS = ['Pessoal', 'Profissional', 'Humor']

export default function PersonalizarExperiencia() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [etapa] = useState(1) // TODO: trocar de etapa quando existirem as telas 2 e 3
  // Recebe do hook os dados do paciente e as ações do formulário.
  const {
    paciente,
    valores,
    carregando,
    erro,
    alterarCampo,
    tentarNovamente,
  } = usePersonalizarExperiencia()

   // Feedback temporário para as etapas que ainda não existem.
  const [aviso, setAviso] = useState('')

  function continuar(evento) {
    evento.preventDefault()

    // A validação e o avanço serão implementados na próxima entrega.
    setAviso(
      'A etapa Profissional ainda está em desenvolvimento. Os dados não foram salvos.'
    )
  }

  // Termina o primeiro acesso e segue para o painel do paciente
  // function concluir() {
  //   concluirPrimeiroAcesso(auth.id)
  //   navigate('/paciente/dashboard', { replace: true })
  // }

   function pularEtapa() {
    // Ainda não conclui o primeiro acesso, pois faltam as próximas etapas.
    setAviso(
      'Ainda não é possível avançar: a etapa Profissional está em desenvolvimento.'
    )
  }
  
  return (
    <main className="flex flex-col items-center justify-center gap-6 min-h-svh py-8 px-4 bg-fundo-suave">
      <Stepper passos={PASSOS} atual={etapa} />

      {/* <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        {etapa === 1 && (
          <DadosPessoais
            valores={valores}
            nomeCompleto={NOME_COMPLETO}
            onAlterarCampo={(campo, valor) => setValores((v) => ({ ...v, [campo]: valor }))}
            onContinuar={(e) => {
              e.preventDefault()
              // TODO: salvar na API e ir para a etapa 2 (Profissional).
              // Por enquanto, como as etapas 2 e 3 não existem, conclui aqui.
              concluir()
            }}
            onPular={concluir}
          />
        )}
      </section> */}

      <section
        aria-busy={carregando}
        className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]"
      >
        {/* Aguarda a consulta antes de mostrar o formulário. */}
        {carregando ? (
          <p role="status" className="text-center text-texto">
            Carregando seus dados...
          </p>
        ) : erro ? (
          // Permite repetir a consulta caso ocorra uma falha.
          <div className="flex flex-col items-center gap-4">
            <p role="alert" className="text-center text-texto">
              {erro}
            </p>

            <button
              type="button"
              onClick={tentarNovamente}
              className="text-primaria underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : etapa === 1 ? (
          <>
            <DadosPessoais
              valores={valores}
              nomeCompleto={paciente?.nome_completo ?? ''}
              onAlterarCampo={(campo, valor) => {
                setAviso('')
                alterarCampo(campo, valor)
              }}
              onContinuar={continuar}
              onPular={pularEtapa}
            />

            {/* Informa a limitação atual sem concluir o fluxo indevidamente. */}
            {aviso && (
              <p
                role="status"
                className="mt-4 text-center text-sm text-texto"
              >
                {aviso}
              </p>
            )}
          </>
        ) : null}
      </section>

      <PontosProgresso className="mt-4" total={PASSOS.length} atual={etapa} />
    </main>
  )
}
