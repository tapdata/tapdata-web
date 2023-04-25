let IDX = 36,
  HEX = ''
while (IDX--) HEX += IDX.toString(36)

export function uid(len, beginNumber = false) {
  let str = '',
    num = len || 11
  while (num--) str += HEX[(Math.random() * 36) | 0]
  if (beginNumber && /^\d/.test(str)) {
    str = 'a' + uid.substring(1)
  }
  return str
}
