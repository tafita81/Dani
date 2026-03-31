export function detectEmergingSignals(messages:any[]){
  const signals:any = {}

  messages.forEach(m=>{
    const text = m.text || ""

    if(text.includes("cansado")) signals['fadiga'] = (signals['fadiga']||0)+1
    if(text.includes("ansiedade")) signals['ansiedade'] = (signals['ansiedade']||0)+1
    if(text.includes("sozinho")) signals['solidão'] = (signals['solidão']||0)+1
  })

  return Object.entries(signals).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0]
}

export function generateUnspokenThoughts(signal:string){
  const map:any = {
    fadiga:[
      "Eu estou cansado, mas não sei explicar por quê",
      "Nem descansar resolve mais",
      "Parece que minha mente não desliga nunca"
    ],
    ansiedade:[
      "Minha cabeça não para nem quando está tudo bem",
      "Eu penso demais em coisas que nem aconteceram",
      "Eu só queria um pouco de silêncio mental"
    ],
    solidão:[
      "Eu estou cercado de pessoas, mas me sinto sozinho",
      "Ninguém entende exatamente o que eu sinto",
      "Eu queria conseguir explicar isso melhor"
    ]
  }

  return map[signal] || ["Algo dentro de você não está bem, mesmo sem motivo claro"]
}
