export function generateDailyPost(){
 const posts=[
 `Tem dias que a mente não desacelera...\nComo isso aparece pra vocês?`,
 `Às vezes o cansaço não é físico...\nVocês também sentem isso?`,
 `A gente se cobra mais do que percebe...\nIsso acontece com vocês?`
 ]
 return posts[Math.floor(Math.random()*posts.length)]
}
