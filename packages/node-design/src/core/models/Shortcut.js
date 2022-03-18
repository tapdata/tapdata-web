import { isFn, KeyCode } from '@daas/shared'

export { KeyCode }

export class Shortcut {
  codes
  handler
  matcher
  constructor(props) {
    this.codes = this.parseCodes(props.codes)
    this.handler = props.handler
    this.matcher = props.matcher
  }

  parseCodes(codes) {
    const results = []
    codes.forEach(code => {
      if (Array.isArray(code)) {
        results.push(code)
      } else {
        results.push([code])
      }
    })
    return results
  }

  preventCodes(codes) {
    if (this.codes.length) {
      for (let i = 0; i < codes.length; i++) {
        const sequence = this.codes[i]
        for (let j = 0; j < sequence.length; j++) {
          if (!Shortcut.matchCode(codes[j], sequence[j])) {
            return false
          }
        }
      }
      return true
    }
    return false
  }

  matched(matched, context) {
    if (isFn(this.handler) && matched) {
      this.handler(context)
    }
    return matched
  }

  match(codes, context) {
    return this.codes.some(sequence => {
      const sortedSelf = Shortcut.sortCodes(sequence)
      const sortedTarget = Shortcut.sortCodes(codes)
      if (isFn(this.matcher)) {
        return this.matched(this.matcher(sortedTarget), context)
      }
      if (sortedTarget.length !== sortedSelf.length) return this.matched(false, context)
      for (let i = 0; i < sortedSelf.length; i++) {
        if (!Shortcut.matchCode(sortedTarget[i], sortedSelf[i])) {
          return this.matched(false, context)
        }
      }
      return this.matched(true, context)
    })
  }

  static matchCode = (code1, code2) => {
    return code1?.toLocaleLowerCase?.() === code2?.toLocaleLowerCase?.()
  }

  static sortCodes = codes => {
    return codes.map(code => code.toLocaleLowerCase()).sort()
  }
}
