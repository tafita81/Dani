import React from 'react'

export default function MetricsCard({title,value}:{title:string,value:number}){
  return (
    <div style={{border:'1px solid #eee',padding:16,borderRadius:8,marginBottom:10}}>
      <h3>{title}</h3>
      <p style={{fontSize:24,fontWeight:'bold'}}>{value}</p>
    </div>
  )
}
