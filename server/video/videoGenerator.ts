export function generateVideoScript(content:string){
 return {
   scenes:[
     { text: content.split("\n")[0], duration: 3 },
     { text: content, duration: 6 }
   ]
 }
}

export function generateVideo(content:string){
 const script = generateVideoScript(content)
 return {
   type:'video',
   script
 }
}
