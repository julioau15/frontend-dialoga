import { useState } from 'react'
import './Avatar.css'

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// size: 'sm' | 'md' | 'lg'
function Avatar({ src, name, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <span className={`avatar avatar--${size}`} title={name}>
      {showImage ? (
        <img src={src} alt={name ?? ''} onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{getInitials(name)}</span>
      )}
    </span>
  )
}

export default Avatar
