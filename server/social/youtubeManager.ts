export function generateYouTubeShort(content:string){
  return {
    title: content.split('\n')[0],
    description: `${content}\n\n#psicologia #saudemental`,
    tags:["psicologia","ansiedade","mente"],
    profileName:"psiajudaprofissional"
  }
}

export function optimizeYouTube(metrics:any, video:any){
  if(metrics.retention < 0.4){
    video.title = `Você precisa ver isso: ${video.title}`
  }
  return video
}
