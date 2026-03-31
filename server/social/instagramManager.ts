export function generateInstagramProfile(){
  return {
    bio: "Entenda sua mente de forma simples | Psicologia prática no dia a dia",
    name: "Mente Descomplicada",
    highlights:["Ansiedade","Autoconhecimento","Relacionamentos"]
  }
}

export function generateInstagramPosts(content:string){
  return {
    caption: `${content}\n\nSalve para lembrar depois.`,
    hashtags:["#psicologia","#ansiedade","#saudemental","#autoconhecimento"]
  }
}

export function optimizeInstagram(profile:any, metrics:any){
  if(metrics.engagement < 0.05){
    profile.bio = "Psicologia que faz sentido | Entenda sua mente sem complicação"
  }
  return profile
}
