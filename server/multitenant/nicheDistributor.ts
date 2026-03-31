import { getActiveAccounts } from './accountManager'

export function distributeByNiche(niche:string, content:any){
  const accounts = getActiveAccounts().filter(a=>a.niche===niche)
  return accounts.map(a=>({ account:a.username, platform:a.platform, payload:content }))
}
