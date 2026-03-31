type UserComment = {
  user: string
  text: string
}

export function detectHighIntentUsers(comments: UserComment[]){
  const signals = [
    'preciso de ajuda',
    'não aguento',
    'quero conversar',
    'como faço',
    'me ajuda'
  ]

  return comments.filter(c=>{
    const t = c.text.toLowerCase()
    return signals.some(s=>t.includes(s))
  })
}

export function generateWhatsAppCTA(){
  const variations = [
    'Se quiser conversar melhor sobre isso, me chama no grupo do WhatsApp',
    'Se fizer sentido, tem um espaço no WhatsApp pra falar disso com calma',
    'Se quiser aprofundar, no WhatsApp a gente conversa melhor sobre isso'
  ]

  return variations[Math.floor(Math.random()*variations.length)]
}

export function connectToWhatsApp(users: UserComment[]){
  return users.map(u=>({
    user: u.user,
    message: generateWhatsAppCTA()
  }))
}
