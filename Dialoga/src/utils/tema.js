// ============================================================
// utils/tema
// Regras do tema claro/escuro, sem React (por isso pode rodar antes da tela abrir).
// O tema fica no atributo  data-theme  da tag <html>:
//   <html data-theme="dark">   -> as cores de styles/variebles.css (bloco escuro) entram em vigor
//   <html data-theme="light">  -> cores padrão
// A escolha da pessoa fica salva no navegador (localStorage).
// ============================================================
export const TEMA = { CLARO: 'light', ESCURO: 'dark' }

const CHAVE = 'dialoga-tema'

// Lê o que a pessoa escolheu antes. Devolve null se nunca escolheu (ou se o navegador bloquear o storage).
export function lerTemaSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return salvo === TEMA.CLARO || salvo === TEMA.ESCURO ? salvo : null
  } catch {
    return null
  }
}

export function salvarTema(tema) {
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // sem storage (modo privado, por exemplo): o tema vale só até fechar a aba
  }
}

// Tema do sistema operacional (usado quando a pessoa ainda não escolheu nada).
export function temaDoSistema() {
  const escuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return escuro ? TEMA.ESCURO : TEMA.CLARO
}

export function temaInicial() {
  return lerTemaSalvo() ?? temaDoSistema()
}

// Coloca o tema na tag <html>. É isso que de fato troca as cores.
export function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema)
}

// Aplica o tema salvo já na abertura do site (chamado no main.jsx, antes de desenhar a tela),
// para a página não "piscar" clara antes de ficar escura.
aplicarTema(temaInicial())
