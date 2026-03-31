import React, { useEffect, useState } from 'react'

export default function FullDashboard(){
  const [metrics,setMetrics]=useState<any>({})

  useEffect(()=>{
    async function load(){
      const res = await fetch('/api/metrics')
      const data = await res.json()
      setMetrics(data)
    }
    load()
  },[])

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>🚀 AI Growth SaaS</h1>

      <section>
        <h2>📊 Métricas</h2>
        <p>Views: {metrics.views || 0}</p>
        <p>Engajamento: {metrics.engagement || 0}</p>
        <p>Conversões WhatsApp: {metrics.conversions || 0}</p>
      </section>

      <section>
        <h2>🤖 Módulos</h2>
        <ul>
          <li>🚗 Assistente de Carro</li>
          <li>🧠 IA Psicologia</li>
          <li>🎬 Geração de Conteúdo</li>
          <li>📱 AutoPost</li>
        </ul>
      </section>

      <section>
        <h2>⚙️ Controle</h2>
        <button>Ativar Sistema</button>
        <button>Gerar Conteúdo</button>
        <button>Forçar Post</button>
      </section>
    </div>
  )
}
