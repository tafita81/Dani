export type Account = {
  id:string
  platform:'tiktok'|'instagram'|'youtube'
  username:string
  niche:string
  active:boolean
}

let accounts:Account[] = []

export function addAccount(acc:Account){
  accounts.push(acc)
}

export function getActiveAccounts(){
  return accounts.filter(a=>a.active)
}
