import { generateContent } from '../ai/contentFromPain'
import { generateVariations } from '../abtest/abEngine'

export function generateNicheContent(niche:string, pain:string){
  const base = generateContent(pain)
  const variations = generateVariations(base)
  return { niche, base, variations }
}
