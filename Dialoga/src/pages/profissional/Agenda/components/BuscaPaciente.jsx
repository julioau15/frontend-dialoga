// ============================================================
// BuscaPaciente
// Campo "Paciente" do pop-up Nova/Editar consulta, com busca:
// ao digitar, mostra até 5 pacientes (mock) cujo nome contém o texto
// (sem diferenciar maiúsculas/acentos). Clique ou Enter escolhe o paciente.
// Teclado: ↑/↓ navegam, Enter escolhe, Esc fecha só a lista.
// Props: label, value, onChange(nome), erro
// TODO: trocar PACIENTES_MOCK pelo useBuscaPaciente quando houver integração.
// ============================================================
import { useId, useMemo, useState } from 'react'
import TextField from '../../../../components/TextField'
import IconeBusca from '../../../../components/IconeBusca'
import { normalizar } from '../../../../utils/datasAgenda'
import { PACIENTES_MOCK } from './consultasMock'

const MAX_SUGESTOES = 5

export default function BuscaPaciente({ label, value, onChange, erro }) {
  const idLista = useId()
  const [aberta, setAberta] = useState(false)
  const [ativa, setAtiva] = useState(-1)

  const termo = normalizar(value.trim())
  const sugestoes = useMemo(
    () =>
      termo
        ? PACIENTES_MOCK.filter((nome) => nome !== value && normalizar(nome).includes(termo)).slice(0, MAX_SUGESTOES)
        : [],
    [termo, value],
  )
  const semResultado = aberta && termo && sugestoes.length === 0 && !PACIENTES_MOCK.includes(value)
  const mostrarLista = aberta && sugestoes.length > 0

  function escolher(nome) {
    onChange(nome)
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
        label={label}
        icone={<IconeBusca />}
        placeholder="Buscar paciente pelo nome"
        value={value}
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
          aria-label="Pacientes encontrados"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-borda bg-branco py-1 shadow-[0_4px_12px_var(--color-sombra-media)]"
        >
          {sugestoes.map((nome, i) => (
            <li
              key={nome}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === ativa}
              // mousedown + preventDefault: escolhe antes do blur fechar a lista
              onMouseDown={(e) => {
                e.preventDefault()
                escolher(nome)
              }}
              onMouseEnter={() => setAtiva(i)}
              className={`cursor-pointer px-3 py-2 text-[12px] text-texto ${i === ativa ? 'bg-fundo-suave-2' : ''}`}
            >
              {nome}
            </li>
          ))}
        </ul>
      )}

      {semResultado && (
        <p className="absolute inset-x-0 top-full z-10 mt-1 rounded-lg border border-borda bg-branco px-3 py-2 text-[12px] text-secundaria shadow-[0_4px_12px_var(--color-sombra-media)]">
          Nenhum paciente encontrado
        </p>
      )}
    </div>
  )
}
