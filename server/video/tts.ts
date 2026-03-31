export async function generateVoice(text:string){
  return {
    provider:"tts",
    audio:`audio-for-${text.slice(0,20)}`
  }
}
