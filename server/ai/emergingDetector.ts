export function detectEmergingPain(messages:any[]) {
  const painMap:any = {}
  messages.forEach(m=>{
    const text = m.text || ""
    let pain = "geral"
    if(text.includes("cansado")) pain="cansaco_emocional"
    if(text.includes("não aguento")) pain="sobrecarga"
    if(text.includes("atrasado")) pain="comparacao_social"

    const weight = (m.depth||0)*0.7
    painMap[pain] = (painMap[pain]||0)+weight
  })
  return Object.entries(painMap).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0]
}
