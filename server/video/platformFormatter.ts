export function formatForPlatform(content:string, platform:'tiktok'|'instagram'|'youtube'){
  if(platform==='tiktok'){
    return {
      duration:10,
      hook:content.split('\n')[0],
      style:'fast-cut',
      captions:'bold-large'
    }
  }

  if(platform==='instagram'){
    return {
      duration:12,
      hook:content.split('\n')[0],
      style:'clean',
      captions:'medium'
    }
  }

  return {
    duration:20,
    hook:content,
    style:'story',
    captions:'medium'
  }
}
