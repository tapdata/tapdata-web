<script setup lang="ts">
import { useColorMode, useDark, useToggle } from '@vueuse/core'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

const isDark = useDark()

const toggleDark = useToggle(isDark)

const btnRef = useTemplateRef('btnRef')
const { store, state, system } = useColorMode({
  emitAuto: true,
})

const theme = ref(store.value)

const currentTheme = computed(() => {
  return theme.value === 'auto' ? system.value : theme.value
})

const darkMode = computed(() => {
  return currentTheme.value === 'dark'
})

const changeTheme = async (mode: 'light' | 'dark' | 'auto') => {
  const newTheme = mode === 'auto' ? system.value : mode
  const isDark = newTheme === 'dark'

  const isAppearanceTransition =
    // @ts-expect-error
    document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition || currentTheme.value === newTheme) {
    theme.value = mode
    await nextTick()
    // store.value = mode
    return
  }

  const target = btnRef.value?.$el
  const rect = target.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  // @ts-ignore startViewTransition
  const transition = document.startViewTransition(async () => {
    theme.value = mode
    await nextTick()
    // store.value = mode
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    const animate = document.documentElement.animate(
      {
        clipPath: isDark ? clipPath.toReversed() : clipPath,
      },
      {
        duration: 450,
        easing: 'ease-in',
        pseudoElement: isDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
    animate.onfinish = () => {
      transition.skipTransition()
    }
  })
}

// watch(
//   currentTheme,
//   (newVal) => {
//     localStorage.theme = newVal
//     // docs 更新延迟，避免 docs localStorage.theme 重置
//     setTimeout(() => {
//       localStorage.theme = newVal
//     }, 0)
//   },
//   {
//     immediate: true,
//   },
// )
watch(theme, () => {
  const root = document.documentElement
  root.classList.toggle('dark', darkMode.value)
})
</script>

<template>
  <ElDropdown
    class="btn"
    placement="bottom"
    :show-timeout="0"
    @command="changeTheme"
  >
    <el-button
      ref="btnRef"
      class="theme-toggle"
      :class="[`is-${darkMode ? 'dark' : 'light'}`]"
      text
      size="large"
    >
      <template #icon>
        <el-icon size="18">
          <!-- <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
            <mask
              id="theme-toggle-moon"
              class="theme-toggle__moon"
              fill="hsl(var(--foreground)/80%)"
              stroke="none"
            >
              <rect fill="white" height="100%" width="100%" x="0" y="0" />
              <circle cx="40" cy="8" fill="black" r="11" />
            </mask>
            <circle
              id="sun"
              class="theme-toggle__sun"
              cx="12"
              cy="12"
              mask="url(#theme-toggle-moon)"
              r="11"
            />
            <g class="theme-toggle__sun-beams">
              <line x1="12" x2="12" y1="1" y2="3" />
              <line x1="12" x2="12" y1="21" y2="23" />
              <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
              <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
              <line x1="1" x2="3" y1="12" y2="12" />
              <line x1="21" x2="23" y1="12" y2="12" />
              <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
              <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
            </g>
          </svg> -->
          <svg
            class="sun-and-moon"
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <mask id="moon-mask" class="moon">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx="24" cy="10" r="6" fill="black" />
            </mask>
            <circle
              class="sun"
              cx="12"
              cy="12"
              r="6"
              mask="url(#moon-mask)"
              fill="currentColor"
            />
            <g class="sun-beams" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g></svg
        ></el-icon>
      </template>
    </el-button>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'light' }"
          command="light"
        >
          <el-icon><i-lucide-sun /></el-icon>
          <span>浅色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'dark' }"
          command="dark"
        >
          <el-icon><i-lucide-moon /></el-icon>
          <span>深色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': theme === 'auto' }"
          command="auto"
        >
          <el-icon><i-lucide-monitor /></el-icon>
          <span>跟随系统</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<!-- <style lang="scss" scoped>
.theme-toggle {
  --foreground: 210 6% 21%;

  svg {
    stroke-linecap: round;
  }

  &__moon {
    & > circle {
      transition: transform 0.5s cubic-bezier(0, 0, 0.3, 1);
    }
  }

  &__sun {
    fill: hsl(var(--foreground) / 0.9);
    stroke: none;

    transform-origin: center center;
    transition: transform 1.6s cubic-bezier(0.25, 0, 0.2, 1);

    &:hover svg > & {
      fill: hsl(var(--foreground) / 0.9);
    }
  }

  &__sun-beams {
    stroke-width: 2px;
    stroke: hsl(var(--foreground) / 0.9);

    transform-origin: center center;
    transition:
      transform 1.6s cubic-bezier(0.5, 1.5, 0.75, 1.25),
      opacity 0.6s cubic-bezier(0.25, 0, 0.3, 1);

    &:hover svg > & {
      stroke: hsl(var(--foreground) / 0.9);
    }
  }

  &.is-light {
    .theme-toggle__sun {
      transform: scale(0.5);
    }

    .theme-toggle__sun-beams {
      transform: rotate(90deg);
    }
  }

  &.is-dark {
    .theme-toggle__moon {
      & > circle {
        transition-delay: 0.3s;
        transform: translateX(-20px);
      }
    }

    .theme-toggle__sun-beams {
      transition-delay: 0.3s;
      opacity: 0;
    }
  }

  &:hover svg {
    .theme-toggle__sun,
    .theme-toggle__moon {
      fill: hsl(var(--foreground));
    }
  }
}

.theme-toggle:where(.dark *) {
  --foreground: 0 0% 95%;
}
</style> -->

<style>
.sun-and-moon {
  --ease-elastic-3: cubic-bezier(0.5, 1.25, 0.75, 1.25);
  --ease-elastic-4: cubic-bezier(0.5, 1.5, 0.75, 1.25);
  --ease-3: cubic-bezier(0.25, 0, 0.3, 1);
  --ease-out-5: cubic-bezier(0, 0, 0, 1);
  --icon-fill: var(--icon-n2);
  --icon-fill-hover: var(--icon-n1);
  stroke-linecap: round;
}

.sun-and-moon > :is(.moon, .sun, .sun-beams) {
  transform-origin: center center;
}

.sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill);
}

.theme-toggle:is(:hover, :focus-visible) .sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill-hover);
}

.sun-and-moon > .sun-beams {
  stroke: var(--icon-fill);
  stroke-width: 2px;
}

.theme-toggle:is(:hover, :focus-visible) .sun-and-moon > .sun-beams {
  stroke: var(--icon-fill-hover);
}

.theme-toggle.is-dark .sun-and-moon > .sun {
  transform: scale(1.75);
}

.theme-toggle.is-dark .sun-and-moon > .sun-beams {
  opacity: 0;
}

.theme-toggle.is-dark .sun-and-moon > .moon > circle {
  transform: translate(-7px);
}

@supports (cx: 1) {
  .theme-toggle.is-dark .sun-and-moon > .moon > circle {
    transform: translate(0);
    cx: 17;
  }
}

.sun-and-moon > .sun {
  transition: transform 0.5s var(--ease-elastic-3);
}

.sun-and-moon > .sun-beams {
  transition:
    transform 0.5s var(--ease-elastic-4),
    opacity 0.5s var(--ease-3);
}

.sun-and-moon .moon > circle {
  transition: transform 0.25s var(--ease-out-5);
}

@supports (cx: 1) {
  .sun-and-moon .moon > circle {
    transition: cx 0.25s var(--ease-out-5);
  }
}

.theme-toggle.is-dark .sun-and-moon > .sun {
  transform: scale(1.75);
  transition-timing-function: var(--ease-3);
  transition-duration: 0.25s;
}

.theme-toggle.is-dark .sun-and-moon > .sun-beams {
  transform: rotate(-25deg);
  transition-duration: 0.15s;
}

.theme-toggle.is-dark .sun-and-moon > .moon > circle {
  transition-delay: 0.25s;
  transition-duration: 0.5s;
}
</style>
