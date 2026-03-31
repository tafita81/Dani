import { Queue } from 'bullmq'

export const contentQueue = new Queue('content',{
  connection:{ host:'redis', port:6379 }
})

export async function addContentJob(data:any){
  await contentQueue.add('generate', data)
}
