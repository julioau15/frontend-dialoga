// ============================================================
// CartaoPerfil
// Cartão do topo da tela do profissional, como no Figma ("Profissional histórico - Paciente"):
//   - avatar de 80px com as iniciais, nome com o título ("Dr. ...") e os selos verdes
//     das modalidades ("Atendimento Online", "Consultório");
//   - "Especialidade" com as etiquetas lilás;
//   - "PRÓXIMA CONSULTA DISPONÍVEL" em verde (some quando não há, ex.: profissional Inativo).
// Props:
//   perfil -> { nomeExibicao, modalidades, especialidades, proximaDisponivel }
// ============================================================
import AvatarIniciais from '../../../../components/AvatarIniciais'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'

// avatar de 80px com as iniciais de 28px em negrito (no mobile: 56px e 20px; o AvatarIniciais não muda)
const AJUSTE_AVATAR =
  'shrink-0 [&>div]:h-14 [&>div]:w-14 [&>div]:text-[20px] [&>div]:font-bold [&>div]:text-primaria-texto sm:[&>div]:h-20 sm:[&>div]:w-20 sm:[&>div]:text-[28px]'

// selo do Figma: 19px de altura, texto de 12px seminegrito e 8px nas laterais (o Selo não muda)
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-[19px] [&>span]:px-2 [&>span]:py-0 [&>span]:text-[11.5px] [&>span]:font-bold'

export default function CartaoPerfil({ perfil }) {
  const { nomeExibicao, modalidades, especialidades, proximaDisponivel } = perfil

  return (
    <Card as="section" aria-label="Perfil do profissional" className="rounded-2xl! p-4 shadow-[0_1px_2px_var(--color-borda)]! sm:p-[23px]!">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* iniciais do primeiro e do último nome, sem o título ("Dr. Carlos Eduardo Mendes" -> "CM") */}
        <div className={AJUSTE_AVATAR}>
          <AvatarIniciais nome={nomeExibicao} />
        </div>
        <div className="min-w-0">
          <h2 className="mt-px break-words text-[17px] font-extrabold leading-6 sm:text-[20px] sm:leading-7 text-texto">{nomeExibicao}</h2>
          {modalidades.length > 0 && (
            <ul aria-label="Modalidades de atendimento" className="mt-1 flex flex-wrap gap-1.5 sm:gap-3">
              {modalidades.map((m) => (
                <li key={m} className={AJUSTE_SELO}>
                  <Selo tom="sucesso">{m}</Selo>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* especialidades */}
      <div className="mt-4 border-t border-borda pt-4 sm:mt-[23px] sm:pt-[23px]">
        <h3 className="text-[15px] font-extrabold leading-6 text-texto sm:text-[16px]">Especialidade</h3>
        <ul className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-[7px] sm:gap-2">
          {especialidades.map((e) => (
            <li
              key={e}
              className="inline-flex h-6 items-center rounded-md bg-fundo-suave px-2.5 text-[12px] sm:h-[27px] sm:px-3 sm:text-[13px] font-semibold text-primaria-texto"
            >
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* próxima consulta (só quando há) */}
      {proximaDisponivel && (
        <div className="mt-4 border-t border-borda pt-4 sm:mt-[23px] sm:pt-6">
          <p className="text-[11px] font-bold uppercase leading-4 text-secundaria">Próxima consulta disponível</p>
          {/* verde do Figma */}
          <p className="mt-1 text-[13px] font-bold leading-5 text-sucesso-texto sm:text-[14px]">{proximaDisponivel}</p>
        </div>
      )}
    </Card>
  )
}
