import { processMessage } from './processMessage'
import { generateContent } from '../ai/contentFromPain'
import { generateVideo } from '../video/videoGenerator'

export async function orchestrator(message:any, state:any){
  const result = processMessage(message, state)

  if(result.action === 'question'){
    return { type:'group_message', text: result.payload }
  }

  const pain = 'cansaco_emocional'
  const content = generateContent(pain)
  const video = generateVideo(content)

  return {
    type:'content',
    payload:{ content, video }
  }
}
