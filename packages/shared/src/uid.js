let IDX = 36,
  HEX = ''
while (IDX--) HEX += IDX.toString(36)

export function uid(len, beginString = '') {
  let str = '',
    num = len || 11
  while (num--) str += HEX[(Math.random() * 36) | 0]
  if (beginString && /^\d/.test(str)) {
    str = beginString + uid.substring(1)
  }
  return str
}
