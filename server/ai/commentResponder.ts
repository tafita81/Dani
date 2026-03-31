type Comment = {
  text: string
  user?: string
}

function detectIntent(text: string){
  const t = text.toLowerCase()

  if(t.includes('eu') || t.includes('comigo') || t.includes('me sinto')) return 'identification'
  if(t.includes('como') || t.includes('por que')) return 'question'
  if(t.includes('cansado') || t.includes('ansioso') || t.includes('triste')) return 'pain'
  if(t.includes('verdade') || t.includes('realmente')) return 'agreement'

  return 'neutral'
}

function generateResponse(intent:string){
  const responses:any = {
    identification:[
      'Isso acontece com mais gente do que parece…',
      'Muita gente sente exatamente isso…',
      'Você não está sozinho nisso…'
    ],
    question:[
      'Depende muito do que você está vivendo agora…',
      'Essa é uma pergunta importante…',
      'Isso tem várias camadas…'
    ],
    pain:[
      'Imagino como isso deve pesar…',
      'Isso cansa mesmo…',
      'Faz sentido se sentir assim…'
    ],
    agreement:[
      'Exatamente…',
      'É bem isso…',
      'Você captou bem…'
    ],
    neutral:[
      'Interessante você trazer isso…',
      'Isso dá o que pensar…',
      'Tem muito nisso…'
    ]
  }

  const pool = responses[intent] || responses['neutral']
  return pool[Math.floor(Math.random()*pool.length)]
}

export function generateCommentReply(comment: Comment){
  const intent = detectIntent(comment.text)
  const base = generateResponse(intent)

  return base
}

export function batchReply(comments: Comment[]){
  return comments.map(c=>({
    original: c.text,
    reply: generateCommentReply(c)
  }))
}
