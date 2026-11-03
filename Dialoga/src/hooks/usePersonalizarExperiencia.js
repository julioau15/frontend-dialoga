import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { buscarMeuPaciente } from '../services/pacienteService'

// Converte a data da API (AAAA-MM-DD ou ISO) para o campo de texto (DD/MM/AAAA).
// Apenas formata o valor; não verifica se a data é válida.
function formatarDataParaCampo(data) {
    if (!data) return ''

    const resultado = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(data))

    // Se o formato não for reconhecido, mantém o campo vazio.
    if (!resultado) return ''

    const [, ano, mes, dia] = resultado
    return `${dia}/${mes}/${ano}`
}

// Centraliza o carregamento do paciente e o controle dos campos da personalização.
export function usePersonalizarExperiencia() {
    const { auth } = useAuth()
    const token = auth?.token

    // Guarda o cadastro retornado pela API e os valores editáveis do formulário.
    const [paciente, setPaciente] = useState(null)
    const [valores, setValores] = useState({
        apelido: '',
        dataNascimento: '',
    })

    // Controla o carregamento, a mensagem de erro e as novas tentativas de busca.
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        // Permite cancelar a busca ao sair da tela ou iniciar outro carregamento.
        const controller = new AbortController()

        async function carregarPaciente() {
            setCarregando(true)
            setErro('')

            try {
                const dados = await buscarMeuPaciente(
                    token,
                    controller.signal
                )

                // Ignora o resultado se esta busca já tiver sido cancelada.
                if (controller.signal.aborted) return

                setPaciente(dados)

                // Preenche os campos com os dados existentes, usando vazio quando necessário.
                setValores({
                    apelido: dados.apelido ?? '',
                    dataNascimento: formatarDataParaCampo(
                        dados.data_nascimento
                    ),
                })
            } catch (error) {
                // Cancelar a busca é esperado e não deve mostrar um erro na tela.
                if (controller.signal.aborted) return

                setErro(
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível carregar seus dados.'
                )
            } finally {
                // Encerra o carregamento somente se esta busca ainda estiver ativa.
                if (!controller.signal.aborted) {
                    setCarregando(false)
                }
            }
        }

        carregarPaciente()

        // Cancela a busca anterior quando o efeito é limpo.
        return () => controller.abort()
    }, [token, tentativa]) // Busca novamente quando o token ou a tentativa mudar.

    function alterarCampo(campo, valor) {
        // Atualiza apenas o campo informado, preservando os demais.
        // A alteração fica no estado local; ainda não é salva na API.
        setValores((anteriores) => ({
            ...anteriores,
            [campo]: valor,
        }))
    }

    function tentarNovamente() {
        // Ao mudar este contador, o efeito executa uma nova busca.
        setTentativa((anterior) => anterior + 1)
    }

    // Disponibiliza os dados e as ações que a página precisa usar.
    return {
        paciente,
        valores,
        carregando,
        erro,
        alterarCampo,
        tentarNovamente,
    }
}