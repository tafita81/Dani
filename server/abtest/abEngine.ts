export function generateVariations(baseContent:string){
  const hooks = [
    `Isso pode estar acontecendo com você...`,
    `Se você sente isso, presta atenção...`,
    `Pouca gente percebe isso...`,
    `Isso explica muito do que você sente...`
  ]

  return hooks.map(hook=>`${hook}\n${baseContent}`)
}

export function scoreVariation(metrics:any){
  return (
    metrics.views * 0.4 +
    metrics.watchTime * 0.3 +
    metrics.shares * 0.3
  )
}

export function pickWinner(variations:any[]){
  return variations.sort((a,b)=>b.score-a.score)[0]
}
