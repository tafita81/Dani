export function generateSubtitles(script:any){
  return script.scenes.map((scene:any, i:number)=>({
    text:scene.text,
    start:i*3,
    end:(i+1)*3,
    style:"bold-center"
  }))
}
