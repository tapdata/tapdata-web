import { each } from '@daas/shared'
import { Path } from '@formily/path'
import { observable } from '@formily/reactive'
import { mergeLocales, lowerSnake, getBrowserLanguage } from './internals'
import { isBehaviorHost, isBehaviorList } from './externals'

const getISOCode = language => {
  let isoCode = DESIGNER_LANGUAGE_STORE.value
  let lang = lowerSnake(language)
  if (DESIGNER_LOCALES_STORE.value[lang]) {
    return lang
  }
  each(DESIGNER_LOCALES_STORE.value, (_, key) => {
    if (key.indexOf(lang) > -1 || String(lang).indexOf(key) > -1) {
      isoCode = key
      return false
    }
  })
  return isoCode
}

const reSortBehaviors = (target, sources) => {
  const findTargetBehavior = behavior => target.includes(behavior)
  const findSourceBehavior = name => {
    for (let key in sources) {
      const { Behavior } = sources[key]
      for (let i = 0; i < Behavior.length; i++) {
        if (Behavior[i].name === name) return Behavior[i]
      }
    }
  }
  each(sources, item => {
    if (!item) return
    if (!isBehaviorHost(item)) return
    const { Behavior } = item
    each(Behavior, behavior => {
      if (findTargetBehavior(behavior)) return
      const name = behavior.name
      each(behavior.extends, dep => {
        const behavior = findSourceBehavior(dep)
        if (!behavior) throw new Error(`No ${dep} behavior that ${name} depends on`)
        if (!findTargetBehavior(behavior)) {
          target.unshift(behavior)
        }
      })
      target.push(behavior)
    })
  })
}

const DESIGNER_BEHAVIORS_STORE = observable.ref([])

const DESIGNER_ICONS_STORE = observable.ref({})

const DESIGNER_LOCALES_STORE = observable.ref({})

const DESIGNER_LANGUAGE_STORE = observable.ref(getBrowserLanguage())

const DESIGNER_GlobalRegistry = {
  setDesignerLanguage: lang => {
    DESIGNER_LANGUAGE_STORE.value = lang
  },

  setDesignerBehaviors: behaviors => {
    DESIGNER_BEHAVIORS_STORE.value = behaviors.reduce((buf, behavior) => {
      if (isBehaviorHost(behavior)) {
        return buf.concat(behavior.Behavior)
      } else if (isBehaviorList(behavior)) {
        return buf.concat(behavior)
      }
      return buf
    }, [])
  },

  getDesignerBehaviors: node => {
    return DESIGNER_BEHAVIORS_STORE.value.filter(pattern => pattern.selector(node))
  },

  getDesignerIcon: name => {
    return DESIGNER_ICONS_STORE[name]
  },

  getDesignerLanguage: () => {
    return getISOCode(DESIGNER_LANGUAGE_STORE.value)
  },

  getDesignerMessage: (token, locales) => {
    const lang = getISOCode(DESIGNER_LANGUAGE_STORE.value)
    const locale = locales ? locales[lang] : DESIGNER_LOCALES_STORE.value[lang]
    if (!locale) {
      for (let key in DESIGNER_LOCALES_STORE.value) {
        const message = Path.getIn(DESIGNER_LOCALES_STORE.value[key], lowerSnake(token))
        if (message) return message
      }
      return
    }
    return Path.getIn(locale, lowerSnake(token))
  },

  registerDesignerIcons: map => {
    Object.assign(DESIGNER_ICONS_STORE, map)
  },

  registerDesignerLocales: (...packages) => {
    packages.forEach(locales => {
      mergeLocales(DESIGNER_LOCALES_STORE.value, locales)
    })
  },

  registerDesignerBehaviors: (...packages) => {
    const results = []
    packages.forEach(sources => {
      reSortBehaviors(results, sources)
    })
    if (results.length) {
      DESIGNER_BEHAVIORS_STORE.value = results
    }
  }
}

export const GlobalRegistry = DESIGNER_GlobalRegistry
