type Comment = { text:string }

export function extractVideoIdea(comment: Comment){
  const text = comment.text.toLowerCase()

  if(text.includes('cansado') || text.includes('exausto')){
    return {
      hook: 'Você descansa… mas continua cansado',
      body: 'Isso pode ser emocional, não físico'
    }
  }

  if(text.includes('ansiedade') || text.includes('ansioso')){
    return {
      hook: 'Sua mente não para mesmo quando tudo está bem',
      body: 'Ansiedade não precisa de motivo claro'
    }
  }

  if(text.includes('relacionamento')){
    return {
      hook: 'Você sente que dá mais do que recebe',
      body: 'Isso desgasta mais do que parece'
    }
  }

  return {
    hook: 'Isso pode estar acontecendo com você…',
    body: comment.text
  }
}

export function generateVideoFromComments(comments: Comment[]){
  return comments.map(c=>{
    const idea = extractVideoIdea(c)

    return {
      hook: idea.hook,
      body: idea.body,
      cta: 'Salva isso pra refletir depois'
    }
  })
}
