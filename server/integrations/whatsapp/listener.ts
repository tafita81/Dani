import makeWASocket from '@whiskeysockets/baileys'
import { orchestrator } from '../core/orchestrator'

export async function startWhatsApp(state:any){
 const sock = makeWASocket({})

 sock.ev.on('messages.upsert', async ({ messages }) => {
  for(const msg of messages){
    const text = msg.message?.conversation
    if(!text) continue

    const result = await orchestrator({ text }, state)

    if(result?.type === 'group_message'){
      await sock.sendMessage(msg.key.remoteJid!, { text: result.text })
    }
  }
 })
}
