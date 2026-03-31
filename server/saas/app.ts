import express from 'express'
import { startWhatsApp } from '../whatsapp/listener'

const app = express()
app.use(express.json())

app.get('/health', (req,res)=>res.json({status:'ok'}))

app.get('/modules', (req,res)=>{
  res.json({
    carAssistant:true,
    therapyAI:true,
    contentEngine:true,
    autopost:true
  })
})

export function startApp(){
  const state:any = { messages:[] }

  startWhatsApp(state)

  app.listen(3000, ()=>{
    console.log('SaaS running on 3000')
  })
}

startApp()
