const triggers={
 baixo:["Mais alguém aqui já sentiu isso também?","Isso acontece com mais alguém aqui?"],
 medio:["Como isso aparece no dia a dia de vocês?","Isso vem em momentos específicos ou é constante?"],
 alto:["Quando isso fica intenso, como vocês lidam?","O que pesa mais nisso pra vocês?"]
}

export function generateGroupQuestion(depth:number){
 if(depth<30) return triggers.baixo[Math.floor(Math.random()*triggers.baixo.length)]
 if(depth<70) return triggers.medio[Math.floor(Math.random()*triggers.medio.length)]
 return triggers.alto[Math.floor(Math.random()*triggers.alto.length)]
}