type Metrics = { views:number; retention:number; shares:number; comments:number }
type Sample = { niche:string; style:string; metrics: Metrics }

// Simple online learner per niche
const store: Record<string, Record<string, number>> = {}

function score(m: Metrics){
  return m.views*0.3 + m.retention*0.4 + m.shares*0.2 + m.comments*0.1
}

export function updateNicheModel(sample: Sample){
  const { niche, style, metrics } = sample
  if(!store[niche]) store[niche] = {}
  if(!store[niche][style]) store[niche][style] = 0

  // exponential moving update
  const s = score(metrics)
  store[niche][style] = store[niche][style]*0.7 + s*0.3
}

export function bestStyleForNiche(niche: string){
  const styles = store[niche]
  if(!styles) return 'fast'
  return Object.entries(styles).sort((a,b)=>b[1]-a[1])[0][0]
}

export function suggestStyles(niche:string){
  const best = bestStyleForNiche(niche)
  const pool = ['fast','clean','emotional','story','contrast']
  const others = pool.filter(p=>p!==best)
  return [best, ...others.slice(0,2)]
}
