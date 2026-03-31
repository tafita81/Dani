export function buildEditTimeline(script:any){
  return script.scenes.map((scene:any, index:number)=>({
    id:index,
    text:scene.text,
    duration:scene.duration,
    style:{
      captions:true,
      zoom:index%2===0?"in":"out",
      emphasis:index===0
    }
  }))
}

export function applyHumanStyleCuts(timeline:any[]){
  return timeline.map(t=>({
    ...t,
    cutPoints:[0, t.duration/2, t.duration],
    dynamic:true
  }))
}
