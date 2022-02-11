/**
 * @author fannie
 * @date 22/5/20
 * @description
 */

import joint from './lib/rappid/rappid'
const V = joint.V
const isString = function (value) {
  var toString = Object.prototype.toString
  return (
    typeof value === 'string' || (!!value && typeof value === 'object' && toString.call(value) === '[object String]')
  )
}

const parseCssNumeric = function (val, restrictUnits) {
  function getUnit(validUnitExp) {
    // one or more numbers, followed by
    // any number of (
    //  `.`, followed by
    //  one or more numbers
    // ), followed by
    // `validUnitExp`, followed by
    // end of string
    var matches = new RegExp('(?:\\d+(?:\\.\\d+)*)(' + validUnitExp + ')$').exec(val)

    if (!matches) return null
    return matches[1]
  }

  var number = parseFloat(val)

  // if `val` cannot be parsed as a number, return `null`
  if (Number.isNaN(number)) return null

  // else: we know `output.value`
  var output = {}
  output.value = number

  // determine the unit
  var validUnitExp
  if (restrictUnits == null) {
    // no restriction
    // accept any unit, as well as no unit
    validUnitExp = '[A-Za-z]*'
  } else if (Array.isArray(restrictUnits)) {
    // if this is an empty array, top restriction - return `null`
    if (restrictUnits.length === 0) return null

    // else: restriction - an array of valid unit strings
    validUnitExp = restrictUnits.join('|')
  } else if (isString(restrictUnits)) {
    // restriction - a single valid unit string
    validUnitExp = restrictUnits
  }
  var unit = getUnit(validUnitExp)

  // if we found no matches for `restrictUnits`, return `null`
  if (unit === null) return null

  // else: we know the unit
  output.unit = unit
  return output
}

const breakText = function (text, size, styles, opt) {
  opt = opt || {}
  styles = styles || {}

  var width = size.width
  var height = size.height

  var svgDocument = opt.svgDocument || V('svg').node
  var textSpan = V('tspan').node
  var textElement = V('text').attr(styles).append(textSpan).node
  var textNode = document.createTextNode('')

  // Prevent flickering
  textElement.style.opacity = 0
  // Prevent FF from throwing an uncaught exception when `getBBox()`
  // called on element that is not in the render tree (is not measurable).
  // <tspan>.getComputedTextLength() returns always 0 in this case.
  // Note that the `textElement` resp. `textSpan` can become hidden
  // when it's appended to the DOM and a `display: none` CSS stylesheet
  // rule gets applied.
  textElement.style.display = 'block'
  textSpan.style.display = 'block'

  textSpan.appendChild(textNode)
  svgDocument.appendChild(textElement)

  if (!opt.svgDocument) {
    document.body.appendChild(svgDocument)
  }

  var separator = typeof opt.separator !== 'string' ? ' ' : opt.separator
  var eol = opt.eol || '\n'
  var hyphen = opt.hyphen ? new RegExp(opt.hyphen) : /[^\w\d]/

  var words = text.split(separator)
  var full = []
  var lines = []
  var p, h
  var lineHeight

  for (var i = 0, l = 0, len = words.length; i < len; i++) {
    var word = words[i]

    if (!word) continue

    if (eol && word.indexOf(eol) >= 0) {
      // word contains end-of-line character
      if (word.length > 1) {
        // separate word and continue cycle
        var eolWords = word.split(eol)
        for (var j = 0, jl = eolWords.length - 1; j < jl; j++) {
          eolWords.splice(2 * j + 1, 0, eol)
        }
        words.splice(i, 1, ...eolWords.filter(word => word !== ''))
        i--
        len = words.length
      } else {
        // creates a new line
        lines[++l] = ''
      }
      continue
    }

    textNode.data = lines[l] ? lines[l] + separator + word : word

    if (textSpan.getComputedTextLength() <= width) {
      // the current line fits
      lines[l] = textNode.data

      if (p || h) {
        // We were partitioning. Put rest of the word onto next line
        full[l++] = true

        // cancel partitioning and splitting by hyphens
        p = 0
        h = 0
      }
    } else {
      if (!lines[l] || p) {
        var partition = !!p

        p = word.length - 1

        if (partition || !p) {
          // word has only one character.
          if (!p) {
            if (!lines[l]) {
              // we won't fit this text within our rect
              lines = []

              break
            }

            // partitioning didn't help on the non-empty line
            // try again, but this time start with a new line

            // cancel partitions created
            words.splice(i, 2, word + words[i + 1])

            // adjust word length
            len--

            full[l++] = true
            i--

            continue
          }

          // move last letter to the beginning of the next word
          words[i] = word.substring(0, p)
          words[i + 1] = word.substring(p) + words[i + 1]
        } else {
          if (h) {
            // cancel splitting and put the words together again
            words.splice(i, 2, words[i] + words[i + 1])
            h = 0
          } else {
            var hyphenIndex = word.search(hyphen)
            if (hyphenIndex > -1 && hyphenIndex !== word.length - 1 && hyphenIndex !== 0) {
              h = hyphenIndex + 1
              p = 0
            }

            // We initiate partitioning or splitting
            // split the long word into two words
            words.splice(i, 1, word.substring(0, h || p), word.substring(h || p))
            // adjust words length
            len++
          }

          if (l && !full[l - 1]) {
            // if the previous line is not full, try to fit max part of
            // the current word there
            l--
          }
        }

        i--

        continue
      }

      l++
      i--
    }

    // if size.height is defined we have to check whether the height of the entire
    // text exceeds the rect height
    if (height !== undefined) {
      if (lineHeight === undefined) {
        var heightValue

        // use the same defaults as in V.prototype.text
        if (styles.lineHeight === 'auto') {
          heightValue = { value: 1.5, unit: 'em' }
        } else {
          heightValue = parseCssNumeric(styles.lineHeight, ['em']) || {
            value: 1,
            unit: 'em'
          }
        }

        lineHeight = heightValue.value
        if (heightValue.unit === 'em') {
          lineHeight *= textElement.getBBox().height
        }
      }

      if (lineHeight * lines.length > height) {
        // remove overflowing lines
        var lastL = Math.floor(height / lineHeight) - 1
        lines.splice(lastL + 1)

        // add ellipsis
        var ellipsis = opt.ellipsis
        if (!ellipsis || lastL < 0) break
        if (typeof ellipsis !== 'string') ellipsis = '\u2026'

        var lastLine = lines[lastL]
        if (!lastLine) break
        var k = lastLine.length
        var lastLineWithOmission, lastChar, separatorChar
        do {
          lastChar = lastLine[k]
          lastLineWithOmission = lastLine.substring(0, k)
          if (!lastChar) {
            separatorChar = typeof separator === 'string' ? separator : ' '
            lastLineWithOmission += separatorChar
          } else if (lastChar.match(separator)) {
            lastLineWithOmission += lastChar
          }
          lastLineWithOmission += ellipsis
          textNode.data = lastLineWithOmission
          if (textSpan.getComputedTextLength() <= width) {
            lines[lastL] = lastLineWithOmission
            break
          }
          k--
        } while (k >= 0)
        break
      }
    }
  }

  if (opt.svgDocument) {
    // svg document was provided, remove the text element only
    svgDocument.removeChild(textElement)
  } else {
    // clean svg document
    document.body.removeChild(svgDocument)
  }

  return lines.join(eol)
}

export default {
  breakText: function (text, width) {
    let fontSize = '14px'
    let str = breakText(
      text,
      { width: width, height: 20 },
      { 'font-size': fontSize },
      { hyphen: '^$', ellipsis: true, separator: '' }
    )
    if (str === text) {
      return str
    } else {
      let before = breakText(
        text,
        { width: width / 2, height: 20 },
        { 'font-size': fontSize },
        { hyphen: '^$', separator: '' }
      )
      let after = text.substr(before.length).split('').reverse().join('')
      after = breakText(
        after,
        { width: width / 2, height: 20 },
        { 'font-size': fontSize },
        { hyphen: '^$', separator: '' }
      )
      after = after.split('').reverse().join('')
      return before + '...' + after
    }
  }
}
