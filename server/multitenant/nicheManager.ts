export type Niche = 'ansiedade'|'autoestima'|'relacionamentos'|'sobrecarga'|'geral'

export const niches:Niche[] = ['ansiedade','autoestima','relacionamentos','sobrecarga','geral']

export function pickNiche(weights?:Record<Niche,number>){
  if(!weights) return niches[Math.floor(Math.random()*niches.length)]
  const entries = Object.entries(weights) as [Niche,number][]
  const total = entries.reduce((s,[,w])=>s+w,0)
  let r = Math.random()*total
  for(const [n,w] of entries){ if((r-=w)<=0) return n }
  return entries[0][0]
}
