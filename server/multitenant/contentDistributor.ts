import { getActiveAccounts } from './accountManager'
import { formatForPlatform } from '../video/platformFormatter'

export async function distributeContent(content:string){
  const accounts = getActiveAccounts()

  return accounts.map(acc=>{
    const formatted = formatForPlatform(content, acc.platform)

    return {
      account: acc.username,
      platform: acc.platform,
      content: formatted
    }
  })
}
