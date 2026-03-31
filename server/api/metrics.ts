import express from 'express'

export const metricsRouter = express.Router()

let metrics = {
  views: 0,
  engagement: 0,
  conversions: 0
}

export function updateMetrics(data:any){
  metrics.views += data.views || 0
  metrics.engagement += data.engagement || 0
  metrics.conversions += data.conversions || 0
}

metricsRouter.get('/metrics', (req,res)=>{
  res.json(metrics)
})
