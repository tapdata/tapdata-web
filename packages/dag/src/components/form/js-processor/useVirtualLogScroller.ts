import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  triggerRef,
  watch,
} from 'vue'

export interface LogEntry {
  id: string
  time: string
  level: string
  content: string
}

interface VirtualLogScrollerOptions {
  /** Estimated single-row height for initial layout (px) */
  estimatedHeight?: number
  /** Number of extra items rendered above/below viewport */
  overscan?: number
  /** Callback when user scrolls near top and hasMore is true */
  onLoadMore?: () => void | Promise<void>
}

/**
 * Virtual scroller composable for a log list that:
 * - Renders only visible items + overscan buffer
 * - Sticks to bottom when new items are appended (unless user scrolled up)
 * - Preserves scroll position when items are prepended (older logs)
 * - Triggers onLoadMore when scrolling near the top
 */
export function useVirtualLogScroller(options: VirtualLogScrollerOptions = {}) {
  const {
    estimatedHeight = 32,
    overscan = 10,
    onLoadMore,
  } = options

  // ── State ──────────────────────────────────────────────────
  const containerRef = ref<HTMLElement | null>(null)
  const items = shallowRef<LogEntry[]>([])
  const hasMore = ref(false)
  const loadingMore = ref(false)
  const isSticky = ref(true) // whether we auto-scroll to bottom

  // Height cache: index → measured height
  const heightCache = new Map<string, number>()
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  // ── Height helpers ──────────────────────────────────────────
  const getItemHeight = (item: LogEntry): number =>
    heightCache.get(item.id) || estimatedHeight

  const getTotalHeight = (): number => {
    let h = 0
    for (const item of items.value) {
      h += getItemHeight(item)
    }
    return h
  }

  const getOffsetAtIndex = (index: number): number => {
    let offset = 0
    const list = items.value
    for (let i = 0; i < index && i < list.length; i++) {
      offset += getItemHeight(list[i]!)
    }
    return offset
  }

  // ── Visible range ──────────────────────────────────────────
  const visibleRange = computed(() => {
    const list = items.value
    if (!list.length) return { start: 0, end: 0 }

    const top = scrollTop.value
    const bottom = top + containerHeight.value

    // Find start index
    let offset = 0
    let start = 0
    for (let i = 0; i < list.length; i++) {
      const h = getItemHeight(list[i]!)
      if (offset + h > top) {
        start = i
        break
      }
      offset += h
      if (i === list.length - 1) start = i
    }

    // Find end index
    let end = start
    let runOffset = offset
    for (let i = start; i < list.length; i++) {
      end = i
      runOffset += getItemHeight(list[i]!)
      if (runOffset >= bottom) break
    }

    // Apply overscan
    start = Math.max(0, start - overscan)
    end = Math.min(list.length, end + overscan + 1)

    return { start, end }
  })

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, i) => ({
      ...item,
      _virtualIndex: start + i,
    }))
  })

  const offsetBefore = computed(() =>
    getOffsetAtIndex(visibleRange.value.start),
  )

  const offsetAfter = computed(() => {
    const { end } = visibleRange.value
    const list = items.value
    let h = 0
    for (let i = end; i < list.length; i++) {
      h += getItemHeight(list[i]!)
    }
    return h
  })

  const totalHeight = computed(() => getTotalHeight())

  // ── Measure rendered items ─────────────────────────────────
  const itemElements = ref<Map<string, HTMLElement>>(new Map())

  // Deduplicated rAF for measure scheduling
  let measureRafId: number | null = null
  const scheduleMeasure = () => {
    if (measureRafId) return // already scheduled
    measureRafId = requestAnimationFrame(() => {
      measureRafId = null
      measureItems()
    })
  }

  const measureItems = () => {
    let changed = false
    itemElements.value.forEach((el, id) => {
      const measured = el.getBoundingClientRect().height
      if (measured > 0 && heightCache.get(id) !== measured) {
        heightCache.set(id, measured)
        changed = true
      }
    })
    if (changed) {
      // Zero-cost reactivity trigger — no array copy
      triggerRef(items)
    }
  }

  const registerItemEl = (id: string, el: HTMLElement | null) => {
    if (el) {
      itemElements.value.set(id, el)
    } else {
      itemElements.value.delete(id)
    }
  }

  // ── Scroll handling ────────────────────────────────────────
  // Guard: true while a load-more cycle (fetch + prepend + scroll restore) is in progress
  let loadMoreLocked = false

  const onScroll = () => {
    const el = containerRef.value
    if (!el) return

    scrollTop.value = el.scrollTop
    containerHeight.value = el.clientHeight

    // Sticky detection: within 2px of bottom
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 2
    isSticky.value = atBottom

    // Measure after scroll settles (deduplicated)
    scheduleMeasure()
  }

  // ── Load-more via IntersectionObserver on sentinel ────────
  const sentinelRef = ref<HTMLElement | null>(null)
  let loadMoreObserver: IntersectionObserver | null = null

  const triggerLoadMore = () => {
    if (loadMoreLocked || !hasMore.value || !onLoadMore) return
    loadMoreLocked = true
    loadingMore.value = true
    const result = onLoadMore()
    if (result && typeof result.then === 'function') {
      result.finally(() => {
        loadingMore.value = false
      })
    } else {
      loadingMore.value = false
    }
  }

  const initSentinelObserver = () => {
    loadMoreObserver?.disconnect()
    const root = containerRef.value
    const sentinel = sentinelRef.value
    if (!root || !sentinel) return

    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerLoadMore()
        }
      },
      { root, threshold: 0 },
    )
    loadMoreObserver.observe(sentinel)
  }

  // ── Scroll to bottom ──────────────────────────────────────
  const scrollToBottom = (smooth = false) => {
    nextTick(() => {
      const el = containerRef.value
      if (!el) return
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      })
      isSticky.value = true
    })
  }

  // ── Data mutation methods ─────────────────────────────────
  const seenIds = new Set<string>()

  /** Append items to the end (new logs). Auto-scrolls if sticky. */
  const append = (...newItems: LogEntry[]) => {
    const deduped = newItems.filter((item) => {
      if (seenIds.has(item.id)) return false
      seenIds.add(item.id)
      return true
    })
    if (!deduped.length) return

    items.value = [...items.value, ...deduped]

    if (isSticky.value) {
      scrollToBottom()
    }
  }

  /** Prepend items at the beginning (older logs). Preserves scroll position.
   *  Returns a Promise that resolves after scroll restoration + measurement. */
  const prepend = (...newItems: LogEntry[]): Promise<void> => {
    const deduped = newItems.filter((item) => {
      if (seenIds.has(item.id)) return false
      seenIds.add(item.id)
      return true
    })
    if (!deduped.length) {
      loadMoreLocked = false
      return Promise.resolve()
    }

    const el = containerRef.value
    const prevScrollHeight = el?.scrollHeight || 0
    const prevScrollTop = el?.scrollTop || 0

    items.value = [...deduped, ...items.value]

    // Restore scroll position so view doesn't jump, then unlock load-more
    return new Promise<void>((resolve) => {
      nextTick(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight
          el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight)
          // Sync reactive state immediately so visibleRange recalculates
          scrollTop.value = el.scrollTop
        }
        // Measure synchronously (DOM is ready after nextTick), then unlock
        measureItems()
        loadMoreLocked = false
        resolve()
      })
    })
  }

  /** Clear all items and reset state */
  const clear = () => {
    items.value = []
    seenIds.clear()
    heightCache.clear()
    itemElements.value.clear()
    hasMore.value = false
    loadingMore.value = false
    isSticky.value = true
    loadMoreLocked = false
  }

  // ── Lifecycle ─────────────────────────────────────────────
  let resizeObserver: ResizeObserver | null = null

  const initContainer = () => {
    const el = containerRef.value
    if (!el) return

    containerHeight.value = el.clientHeight
    scrollTop.value = el.scrollTop

    el.addEventListener('scroll', onScroll, { passive: true })

    resizeObserver = new ResizeObserver(() => {
      if (containerRef.value) {
        containerHeight.value = containerRef.value.clientHeight
      }
    })
    resizeObserver.observe(el)
  }

  // Watch for container ref being set
  watch(containerRef, (el) => {
    if (el) {
      initContainer()
      initSentinelObserver()
    }
  })

  // Watch for sentinel ref being set (may mount after container)
  watch(sentinelRef, () => {
    initSentinelObserver()
  })

  // Watch items changes - measure after render (uses deduplicated rAF)
  watch(
    () => items.value.length,
    () => {
      nextTick(scheduleMeasure)
    },
  )

  onBeforeUnmount(() => {
    const el = containerRef.value
    if (el) {
      el.removeEventListener('scroll', onScroll)
    }
    resizeObserver?.disconnect()
    loadMoreObserver?.disconnect()
    if (measureRafId) cancelAnimationFrame(measureRafId)
  })

  return {
    // Refs to bind
    containerRef,
    sentinelRef,

    // Reactive state
    items,
    hasMore,
    loadingMore,
    isSticky,
    totalHeight,

    // Computed for rendering
    visibleItems,
    offsetBefore,
    offsetAfter,

    // Methods
    append,
    prepend,
    clear,
    scrollToBottom,
    registerItemEl,
  }
}

