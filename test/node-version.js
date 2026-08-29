export const NODE_MAJOR = Number.parseInt(process.versions.node.split('.')[0], 10)

/** @param {'temporal'|'toBase64'|'urlPattern'|'fromHex'} feature  */
export function ifSupports(feature) {
  //
  if(feature === 'temporal' && NODE_MAJOR >= 26) { return true }

  //
  if(feature === 'toBase64' && NODE_MAJOR >= 25) { return true }
  if(feature === 'fromHex' && NODE_MAJOR >= 25) { return true }

  //
  if(feature === 'urlPattern' && NODE_MAJOR >= 23) { return true }

  return false
}