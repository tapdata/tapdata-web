<template functional>
  <div
    class="empty-wrap"
    :class="{
      'empty-small': props.small
    }"
  >
    <div class="empty-image">
      <svg class="empty-img-simple" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
          <ellipse class="empty-img-simple-ellipse" cx="32" cy="33" rx="32" ry="7"></ellipse>
          <g class="empty-img-simple-g" fill-rule="nonzero">
            <path
              d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
            ></path>
            <path
              d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
              class="empty-img-simple-path"
            ></path>
          </g>
        </g>
      </svg>
    </div>
    <p class="empty-desc">{{ parent.$t('public_data_no_data') }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmptyItem',
  props: {
    small: Boolean
  }
}
</script>

<style lang="scss" scoped>
.empty-wrap {
  margin: 32px 0;
  font-size: 14px;
  line-height: 1.5715;
  text-align: center;
  color: rgba(0, 0, 0, 0.25);

  &.empty-small {
    margin: 8px 0;
    font-size: 12px;

    .empty-image {
      height: 35px;
    }
  }

  .empty-image {
    height: 40px;
    margin-bottom: 8px;
    svg {
      height: 100%;
      margin: auto;
      overflow: hidden;
    }
  }

  .empty-desc {
    margin: 0;
  }

  .empty-img-simple-ellipse {
    fill: #f5f5f5;
  }

  .empty-img-simple-g {
    stroke: #d9d9d9;
  }

  .empty-img-simple-path {
    fill: #fafafa;
  }
}
</style>
