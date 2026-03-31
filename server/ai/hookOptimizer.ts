type Comment = { text: string }

const patterns = [
  { key: 'relate', triggers: ['eu', 'comigo', 'me sinto', 'sou assim'], hook: 'Isso pode estar acontecendo com você...' },
  { key: 'validation', triggers: ['finalmente', 'alguém falou', 'é isso'], hook: 'Ninguém fala sobre isso...' },
  { key: 'pain', triggers: ['cansado', 'ansioso', 'esgotado', 'triste'], hook: 'Se você sente isso, presta atenção...' },
  { key: 'curiosity', triggers: ['por quê', 'como', 'não entendo'], hook: 'Isso explica muito do que você sente...' },
  { key: 'blindspot', triggers: ['nem percebo', 'sem perceber'], hook: 'Você não percebe, mas isso te afeta...' }
]

export function extractSignals(comments: Comment[]) {
  const scores: Record<string, number> = {}
  for (const p of patterns) scores[p.key] = 0

  for (const c of comments) {
    const t = (c.text || '').toLowerCase()
    for (const p of patterns) {
      if (p.triggers.some(tr => t.includes(tr))) {
        scores[p.key] += 1
      }
    }
  }
  return scores
}

export function chooseBestHook(comments: Comment[]) {
  const scores = extractSignals(comments)
  const best = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0]?.[0]
  const pattern = patterns.find(p=>p.key===best)
  return pattern?.hook || patterns[0].hook
}

export function generateHookVariations(baseHook: string) {
  const variants = [
    baseHook,
    baseHook.replace('Isso pode', 'Talvez isso possa'),
    baseHook.replace('Ninguém fala', 'Quase ninguém fala'),
    baseHook + ' (importante)',
    baseHook.replace('você', 'muita gente')
  ]
  return Array.from(new Set(variants))
}
