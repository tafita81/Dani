export function generateNewFormat(signal:string){
  const formats:any = {
    fadiga:[
      {
        type:"micro-reflexao",
        structure:["frase curta","pausa","quebra de expectativa"],
        example:"Você descansa… mas continua cansado."
      },
      {
        type:"duas-vozes",
        structure:["voz 1 (pensamento)","voz 2 (realidade)"],
        example:"Eu vou descansar hoje / Minha mente: vamos pensar em tudo"
      }
    ],
    ansiedade:[
      {
        type:"loop-mental",
        structure:["pergunta","repetição","intensificação"],
        example:"E se der errado? E se der errado? E se der errado?"
      }
    ],
    solidão:[
      {
        type:"contraste-social",
        structure:["cena social","sentimento interno"],
        example:"Rindo com todo mundo… mas por dentro em silêncio"
      }
    ]
  }

  return formats[signal] || [
    {
      type:"insight-direto",
      structure:["frase","quebra"],
      example:"Algo dentro de você não está bem… e você sente isso"
    }
  ]
}
