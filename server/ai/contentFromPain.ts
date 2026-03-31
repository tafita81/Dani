export function generateContent(pain:string){
 const map:any={
 cansaco_emocional:`Ninguém fala sobre isso...\nmas esse cansaço pode ser emocional.`,
 sobrecarga:`Se você sente que não aguenta mais...\npode ser mais do que um dia ruim.`,
 comparacao_social:`Você sente que está atrasado na vida...\nmesmo tentando?`
 }
 return map[pain]||"Algo pode estar te afetando mais do que parece."
}
