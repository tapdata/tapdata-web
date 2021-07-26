import { isFunction } from '@/utils/util'

export function matchesSelectorToParentElements(el, selector, baseNode) {
  let node = el

  const matchesSelectorFunc = [
    'matches',
    'webkitMatchesSelector',
    'mozMatchesSelector',
    'msMatchesSelector',
    'oMatchesSelector'
  ].find(func => isFunction(node[func]))

  if (!isFunction(node[matchesSelectorFunc])) return false

  do {
    if (node[matchesSelectorFunc](selector)) return true
    if (node === baseNode) return false
    node = node.parentNode
  } while (node)

  return false
}

export function on(el, event, handler) {
  if (!el) {
    return
  }
  if (el.attachEvent) {
    el.attachEvent('on' + event, handler)
  } else if (el.addEventListener) {
    el.addEventListener(event, handler, false)
  } else {
    el['on' + event] = handler
  }
}

export function off(el, event, handler) {
  if (!el) {
    return
  }
  if (el.detachEvent) {
    el.detachEvent('on' + event, handler)
  } else if (el.removeEventListener) {
    el.removeEventListener(event, handler, false)
  } else {
    el['on' + event] = null
  }
}

export function appendHtml(el, html) {
  return insertHtml(el, html)
}

export function prependHtml(el, html) {
  return insertHtml(el, html, 'insertBefore')
}

function insertHtml(el, html, func = 'appendChild') {
  let div = document.createElement('div')
  div.innerHTML = html
  let nodes = div.childNodes,
    fragment = document.createDocumentFragment()
  let _nodes = []
  for (let node of nodes) {
    let el = node.cloneNode(true)
    _nodes.push(el)
    fragment.appendChild(el)
  }
  el[func](fragment)
  fragment = null
  return _nodes.length > 1 ? nodes : _nodes[0]
}
