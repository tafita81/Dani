import { exec } from 'child_process'

export function renderVideo(input:string, output:string){
 return new Promise((resolve,reject)=>{
   exec(`ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=10 -vf \"drawtext=text='${input}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2\" ${output}`,(err)=>{
     if(err) reject(err)
     else resolve(output)
   })
 })
}
