export function generateVariationsFromBase(baseScripts:any[]){
  const hooks = [
    "Isso pode estar acontecendo com você...",
    "Ninguém fala sobre isso...",
    "Se você sente isso, presta atenção...",
    "Isso explica muito do que você sente...",
    "Você não percebe, mas isso te afeta..."
  ]

  const styles = ["fast","clean","emotional"]
  const captions = [
    "Salva isso",
    "Guarda isso",
    "Pode fazer sentido depois"
  ]

  const variations:any[] = []

  baseScripts.forEach((script)=>{
    hooks.forEach(h=>{
      styles.forEach(s=>{
        captions.forEach(c=>{
          variations.push({
            hook:h,
            body:script.body,
            style:s,
            caption:c
          })
        })
      })
    })
  })

  return variations
}

export function pickTopVariations(data:any[]){
  return data.sort((a,b)=>b.score-a.score).slice(0,10)
}
