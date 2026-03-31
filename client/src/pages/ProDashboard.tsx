import React, { useEffect, useState } from 'react'
import MetricsCard from '../components/MetricsCard'

export default function ProDashboard(){
  const [metrics,setMetrics]=useState<any>({})

  useEffect(()=>{
    const interval = setInterval(async ()=>{
      const res = await fetch('/metrics')
      const data = await res.json()
      setMetrics(data)
    },2000)

    return ()=>clearInterval(interval)
  },[])

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>📊 Painel Profissional</h1>

      <div style={{display:'flex',gap:10}}>
        <MetricsCard title="Views" value={metrics.views||0}/>
        <MetricsCard title="Engajamento" value={metrics.engagement||0}/>
        <MetricsCard title="Conversões" value={metrics.conversions||0}/>
      </div>

      <h2 style={{marginTop:30}}>⚙️ Ações</h2>
      <button>Gerar 10 vídeos</button>
      <button>Escalar conteúdo vencedor</button>
      <button>Ativar multi-conta</button>

      <h2 style={{marginTop:30}}>🧠 Sistema</h2>
      <p>IA ativa e aprendendo em tempo real</p>
    </div>
  )
}
