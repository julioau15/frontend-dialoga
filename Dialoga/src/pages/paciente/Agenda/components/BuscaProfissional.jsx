// ============================================================
// BuscaProfissional (paciente)
// Campo "Profissional" do pop-up Nova consulta, com busca:
// ao digitar, filtra os profissionais com vínculo ativo cujo nome contém o texto
// (sem diferenciar maiúsculas/acentos); com o campo vazio mostra os primeiros da lista.
// Clique ou Enter escolhe. Teclado: ↑/↓ navegam, Enter escolhe, Esc fecha só a lista.
// Props: value (texto do campo), profissionais ([{ idVinculo, nome, especialidade }]),
//        onChange(texto) -> o usuário digitou (a escolha anterior deixa de valer),
//        onEscolher(profissional), erro, desabilitado
// ============================================================
import { useId, useMemo, useState } from 'react'
import TextField from '../../../../components/TextField'
import IconeBusca from '../../../../components/IconeBusca'
import { normalizar } from '../../../../utils/datasAgenda'

const MAX_SUGESTOES = 6

export default function BuscaProfissional({ value, profissionais, onChange, onEscolher, erro, desabilitado = false }) {
  const idLista = useId()
  const [aberta, setAberta] = useState(false)
  const [ativa, setAtiva] = useState(-1)

  const termo = normalizar(value.trim())
  const jaEscolhido = profissionais.some((p) => p.nome === value)
  const sugestoes = useMemo(
    () => (jaEscolhido ? [] : profissionais.filter((p) => !termo || normalizar(p.nome).includes(termo)).slice(0, MAX_SUGESTOES)),
    [termo, jaEscolhido, profissionais],
  )
  const mostrarLista = aberta && sugestoes.length > 0
  const semResultado = aberta && !jaEscolhido && sugestoes.length === 0

  function escolher(profissional) {
    onEscolher(profissional)
    setAberta(false)
    setAtiva(-1)
  }

  function aoTeclar(e) {
    if (!mostrarLista) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtiva((i) => (i + 1) % sugestoes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtiva((i) => (i <= 0 ? sugestoes.length - 1 : i - 1))
    } else if (e.key === 'Enter' && ativa >= 0) {
      e.preventDefault()
      escolher(sugestoes[ativa])
    } else if (e.key === 'Escape') {
      e.preventDefault() // fecha só a lista, não o pop-up
      setAberta(false)
    }
  }

  return (
    <div className="relative">
      <TextField
        label={<>Profissional <span className="text-erro-texto">*</span></>}
        icone={<IconeBusca />}
        placeholder="Buscar profissional pelo nome"
        value={value}
        disabled={desabilitado}
        onChange={(e) => {
          onChange(e.target.value)
          setAberta(true)
          setAtiva(-1)
        }}
        onFocus={() => setAberta(true)}
        onBlur={() => setAberta(false)}
        onKeyDown={aoTeclar}
        erro={erro}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={mostrarLista}
        aria-controls={idLista}
        aria-activedescendant={mostrarLista && ativa >= 0 ? `${idLista}-${ativa}` : undefined}
      />

      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Profissionais encontrados"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-borda bg-superficie py-1 shadow-[0_4px_12px_var(--color-sombra-media)]"
        >
          {sugestoes.map((p, i) => (
            <li
              key={p.idVinculo}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === ativa}
              // mousedown + preventDefault: escolhe antes do blur fechar a lista
              onMouseDown={(e) => {
                e.preventDefault()
                escolher(p)
              }}
              onMouseEnter={() => setAtiva(i)}
              className={`cursor-pointer px-3 py-2 ${i === ativa ? 'bg-fundo-suave-2' : ''}`}
            >
              <span className="block text-[12px] text-texto">{p.nome}</span>
              <span className="block text-[10px] text-secundaria">{p.especialidade}</span>
            </li>
          ))}
        </ul>
      )}

      {semResultado && (
        <p className="absolute inset-x-0 top-full z-10 mt-1 rounded-lg border border-borda bg-superficie px-3 py-2 text-[12px] text-secundaria shadow-[0_4px_12px_var(--color-sombra-media)]">
          {profissionais.length === 0
            ? 'Você ainda não tem profissional com acompanhamento ativo.'
            : 'Nenhum profissional encontrado'}
        </p>
      )}
    </div>
  )
}
