export function calculateEmotionalDepth(text:string){
 let score=0
 if(text.includes("não aguento")) score+=30
 if(text.includes("cansado")) score+=25
 if(text.includes("me sinto")) score+=20
 return Math.min(score,100)
}