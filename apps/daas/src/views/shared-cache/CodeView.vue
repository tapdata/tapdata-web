<template>
  <div class="code-view overflow-hidden">
    <div class="flex">
      <div class="code mr-2">
        <span class="color-primary">var</span> cachedRow = CacheService.getCache(
        <span class="color-danger">'{{ data.name || 'cachename' }}'</span>
        <template v-if="!data.cacheKeys || !data.cacheKeys.length">
          ,<span class="bold">record</span>.<span class="color-danger">category_code</span>
        </template>
        <span v-for="key in cacheKeysArr" :key="key">
          <template v-if="key">
            , <span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
          </template>
        </span>
        );<br />
        <span class="bold">record</span>.category_name = cachedRow.category_name;<br />
      </div>
      <ClipButton :value="script[0]"></ClipButton>
    </div>
    <div class="my-2">OR</div>
    <div class="flex">
      <div class="code mr-2">
        <span class="bold">record</span>.category_name = CacheService.getCacheItem(
        <span class="color-danger">'{{ data.name || 'cachename' }}'</span>, <span>'category_name'</span>, defaultValue
        <span v-for="key in cacheKeysArr" :key="key">
          <template v-if="key">
            ,<span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
          </template>
        </span>
        );
      </div>
      <ClipButton :value="script[1]"></ClipButton>
    </div>
  </div>
</template>

<script>
import ClipButton from '@/components/ClipButton'
import { getCode } from '@tap/shared'
export default {
  components: {
    ClipButton
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    cacheKeysArr() {
      return this.data?.cacheKeys?.split(',') || []
    },
    script() {
      return getCode(this.data)
    }
  }
}
</script>

<style lang="scss" scoped>
.code-view {
  padding: 16px;
  width: 1025px;
  max-width: 100%;
  background: #3a3d4c;
  border-radius: 2px;
  color: #bfd0ff;
}
.code {
  flex: 1;
  padding: 8px;
  white-space: nowrap;
  border-radius: 2px;
  background: #262838;
  overflow-x: auto;
  color: #82b290;
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15);
  }
  .bold {
    font-weight: bold;
  }
}
</style>
