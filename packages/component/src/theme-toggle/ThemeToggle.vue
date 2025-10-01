<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { nextTick, ref, useTemplateRef, watch } from 'vue'

const btnRef = useTemplateRef('btnRef')
const { store, state, system } = useColorMode({
  emitAuto: true,
})
const theme = ref(store.value)

const changeTheme = (mode: 'light' | 'dark' | 'auto') => {
  const newTheme = mode === 'auto' ? system.value : mode

  const isAppearanceTransition =
    // @ts-expect-error
    document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!isAppearanceTransition || state.value === newTheme) {
    store.value = mode
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
  const transition = document.startViewTransition(() => {
    store.value = mode
    // await nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    const animate = document.documentElement.animate(
      {
        clipPath: state.value === 'dark' ? clipPath.toReversed() : clipPath,
      },
      {
        duration: 450,
        easing: 'ease-in',
        pseudoElement:
          state.value === 'dark'
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
      },
    )
    animate.onfinish = () => {
      transition.skipTransition()
    }
  })
}

watch(state, (newVal) => {
  localStorage.theme = newVal
  nextTick(() => {
    theme.value = newVal
    // docs 更新延迟，避免 docs localStorage.theme 重置
    localStorage.theme = newVal
  })
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
      :class="[`is-${theme}`]"
      text
      size="large"
    >
      <template #icon>
        <el-icon size="18">
          <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
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
          </svg>
        </el-icon>
      </template>
    </el-button>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': store === 'light' }"
          command="light"
        >
          <el-icon><i-lucide-sun /></el-icon>
          <span>浅色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': store === 'dark' }"
          command="dark"
        >
          <el-icon><i-lucide-moon /></el-icon>
          <span>深色</span>
        </ElDropdownItem>
        <ElDropdownItem
          class="gap-2 pr-2"
          :class="{ 'is-active': store === 'auto' }"
          command="auto"
        >
          <el-icon><i-lucide-monitor /></el-icon>
          <span>跟随系统</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<style lang="scss" scoped>
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
        transition-delay: 0.4s;
        transform: translateX(-20px);
      }
    }

    .theme-toggle__sun-beams {
      transition-delay: 0.4s;
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
</style>
