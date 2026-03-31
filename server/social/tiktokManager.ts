export function generateTikTokPost(content:string){
  const hook = content.split('\n')[0]
  return {
    caption: `${hook}\n\nSalva isso pra depois.`,
    hashtags:["#psicologia","#foryou","#ansiedade","#mentesaudavel"],
    profileName:"psiajudaprofissional"
  }
}

export function optimizeTikTok(metrics:any, post:any){
  if(metrics.watchTime < 0.3){
    post.caption = `${post.caption}\n\nAssiste até o final.`
  }
  return post
}
