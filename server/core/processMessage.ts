import { calculateEmotionalDepth } from '../emotion/depthAnalyzer'
import { detectEmergingPain } from '../ai/emergingDetector'
import { generateGroupQuestion } from '../community/questionEngine'

export function processMessage(message:any, state:any){
 const depth = calculateEmotionalDepth(message.text)

 state.messages.push({ ...message, depth })

 const pain = detectEmergingPain(state.messages)

 if(depth > 60){
   return {
     action: 'question',
     payload: generateGroupQuestion(depth)
   }
 }

 return { action: 'none' }
}
