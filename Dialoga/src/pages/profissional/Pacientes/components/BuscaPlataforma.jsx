// ============================================================
// BuscaPlataforma
// Campo de busca com lista suspensa (dropdown) do pop-up "Adicionar paciente" (RF303).
// O profissional escreve e a lista de pacientes da plataforma abre colada embaixo
// do campo, por cima do resto do pop-up (não empurra o layout).
// Cada opção: avatar com iniciais, nome e e-mail; a opção escolhida mostra ✓.
// Acessível (padrão "combobox" do WAI-ARIA):
//   setas ↑/↓ andam pelas opções, Enter escolhe, Esc fecha só a lista
//   (sem fechar o pop-up) e o leitor de tela anuncia a opção em destaque.
// Props:
//   rotulo        -> nome do campo para leitores de tela
//   placeholder   -> texto de exemplo do campo (o do Figma)
//   valor         -> texto digitado
//   onMudarValor  -> (texto) => void, a cada tecla
//   resultados    -> [{ id, nome, email }] já filtrados pelo pop-up
//   aviso         -> texto no lugar de "Nenhum paciente encontrado" enquanto não há resultado
//                    (ex.: "Buscando pacientes...", mensagem de erro); null = sem aviso
//   selecionadoId -> id do paciente escolhido (ou null)
//   onEscolher    -> (paciente) => void, ao clicar numa opção ou apertar Enter
//   inputRef      -> ref do <input> (opcional, para o pop-up dar foco)
// ============================================================
import { useId, useState } from 'react'
import AvatarIniciais from '../../../../components/AvatarIniciais'
import { IconeCheck } from '../../../../components/Icones'
import { doisPrimeirosNomes } from '../../../../utils/formatadores'
import CampoPaciente from './CampoPaciente'

export default function BuscaPlataforma({ rotulo, placeholder, valor, onMudarValor, resultados, aviso = null, selecionadoId, onEscolher, inputRef }) {
  const idLista = useId()
  const [aberta, setAberta] = useState(false)
  const [ativo, setAtivo] = useState(-1) // opção em destaque pelo teclado (-1 = nenhuma)

  // a lista só aparece com o campo em uso e algo digitado
  const mostrarLista = aberta && valor.trim() !== ''
  // se a lista diminuiu, o destaque antigo deixa de valer
  const ativoValido = ativo < resultados.length ? ativo : -1
  const idOpcao = (paciente) => `${idLista}-${paciente.id}`

  // a cada tecla: abre a lista e tira o destaque
  function digitar(evento) {
    onMudarValor(evento.target.value)
    setAberta(true)
    setAtivo(-1)
  }

  // escolhe o paciente e fecha a lista
  function escolher(paciente) {
    onEscolher(paciente)
    setAberta(false)
    setAtivo(-1)
  }

  // move o destaque e rola a lista até a opção, se ela estiver escondida
  function destacar(indice) {
    setAtivo(indice)
    document.getElementById(idOpcao(resultados[indice]))?.scrollIntoView({ block: 'nearest' })
  }

  // teclado do combobox
  function teclar(evento) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault() // não move o cursor do texto
      setAberta(true)
      if (resultados.length === 0) return
      const passo = evento.key === 'ArrowDown' ? 1 : -1
      destacar((ativoValido + passo + resultados.length) % resultados.length)
    } else if (evento.key === 'Enter' && mostrarLista && ativoValido >= 0) {
      evento.preventDefault() // Enter escolhe a opção em vez de enviar o formulário
      escolher(resultados[ativoValido])
    } else if (evento.key === 'Escape' && mostrarLista) {
      evento.preventDefault() // fecha só a lista; o pop-up continua aberto
      setAberta(false)
    }
  }

  return (
    <div className="relative">
      <CampoPaciente
        comLupa
        rotulo={rotulo}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={mostrarLista}
        aria-controls={idLista}
        aria-activedescendant={mostrarLista && ativoValido >= 0 ? idOpcao(resultados[ativoValido]) : undefined}
        placeholder={placeholder}
        // com a lista aberta, a parte de baixo do campo fica reta para encaixar na lista
        className={`h-[46px] gap-3 pl-[13px] pr-4 ${mostrarLista ? 'rounded-b-none' : ''}`}
        inputRef={inputRef}
        value={valor}
        onChange={digitar}
        onFocus={() => setAberta(true)}
        onBlur={() => setAberta(false)}
        onKeyDown={teclar}
        acao={selecionadoId != null && !mostrarLista ? <IconeCheck tamanho={16} className="text-sucesso-escura-texto" /> : null}
      />

      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label={`Pacientes encontrados para ${rotulo.toLowerCase()}`}
          className="absolute inset-x-0 top-full z-10 max-h-[176px] overflow-y-auto rounded-b-xl border-t border-borda bg-superficie py-1 shadow-[0_0_0_1px_var(--color-primaria),0_8px_16px_var(--color-sombra)]"
        >
          {resultados.length === 0 ? (
            <li role="option" aria-disabled="true" aria-selected="false" className="px-4 py-3 text-[12px] text-secundaria">
              {aviso ?? 'Nenhum paciente encontrado na plataforma.'}
            </li>
          ) : (
            resultados.map((p, indice) => {
              const escolhido = p.id === selecionadoId
              return (
                <li
                  key={p.id}
                  id={idOpcao(p)}
                  role="option"
                  aria-selected={escolhido}
                  // mouseDown com preventDefault: o campo não perde o foco antes do clique contar
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => escolher(p)}
                  onMouseEnter={() => setAtivo(indice)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${indice === ativoValido ? 'bg-fundo-suave' : ''}`}
                >
                  <AvatarIniciais nome={doisPrimeirosNomes(p.nome).join(' ')} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] font-bold leading-5 text-texto">{p.nome}</span>
                    <span className="truncate text-[12px] leading-4 text-secundaria">{p.email}</span>
                  </span>
                  {escolhido && <IconeCheck tamanho={16} className="text-primaria-texto" />}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
