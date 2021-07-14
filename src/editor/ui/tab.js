/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/1/20
 * @description
 */
import Component from '../lib/Component'
import $ from 'jquery'
import { EditorEventType } from '../lib/events'

export default class Tab extends Component {
  constructor(opts) {
    super(opts)

    this.showTapbar = true

    this.init()
  }

  doInit() {
    this.el = $(`
		<div class="e-tab-panel">
			<div class="e-tab-bar"></div>
			<div class="e-tab-content"></div>
		</div>
		`)

    if (this.opts.hiddenTabBar) {
      this.hideTapBar()
    }
  }

  __id = 1
  generatorId() {
    return this.__id++
  }

  hideTapBar() {
    this.el.find('.e-tab-bar').hide()
    this.showTapbar = false
  }
  showTapBar() {
    this.showTapbar = true
    this.el.find('.e-tab-bar').show()
  }

  add(tab, prepend = false) {
    let self = this
    self.childs.push(tab)

    tab.id = self.generatorId()

    let titleEl = $(`<div class="e-tab-title">${tab.title || tab.opts.title}</div>`)
    let tabEl = $(`<div class="e-tab"></div>`)

    titleEl.attr('data-target', `${tab.id}`)
    tabEl.attr('data-value', `${tab.id}`)

    if (prepend) {
      self.el.find('.e-tab-bar').prepend(titleEl)
      self.el.find('.e-tab-content').prepend(tabEl)
    } else {
      self.el.find('.e-tab-bar').append(titleEl)
      self.el.find('.e-tab-content').append(tabEl)
    }
    if (tab.opts.closeBtn) {
      let closeBt = $('<i class="el-icon-close" style="position:absolute;right:23px;cursor:pointer"></i>')
      closeBt.click(() => {
        self.parent.hide()
      })
      self.el.find('.e-tab-bar').append(closeBt)
    }
    tabEl.append(tab.el)

    titleEl.on('click', () => {
      self.select(tab)
    })

    if (self.childs.length === 1) {
      self.select(tab)
    }
  }

  select(tab) {
    this.el.find('>.e-tab-bar>.active').removeClass('active')
    this.el.find('>.e-tab-content>.active').removeClass('active')
    let id = tab.id ? tab.id : tab.target ? $(tab.target).data('target') : ''
    if (id) {
      this.el.find(`>.e-tab-bar>.e-tab-title[data-target=${id}]`).addClass('active')
      this.el.find(`>.e-tab-content>.e-tab[data-value=${id}]`).addClass('active')
    }
    this.childs.forEach(child => (child.selected = child === tab))
    this.emit(EditorEventType.SELECTED, tab)
  }

  remove(child) {
    super.remove(child)
    let id = child.id
    if (id) {
      this.el.find(`>.e-tab-bar>.e-tab-title[data-target=${id}]`).remove()
      this.el.find(`>.e-tab-content>.e-tab[data-value=${id}]`).remove()
    }
    if (this.childs.length > 0) {
      this.select(this.childs[0])
    }
  }

  removeAll() {
    super.removeAll()
    this.el.find(`>.e-tab-bar>.e-tab-title`).remove()
    this.el.find(`>.e-tab-content>.e-tab`).remove()
  }

  getContentEl() {
    return this.el.find('>.e-tab-content')
  }
}
