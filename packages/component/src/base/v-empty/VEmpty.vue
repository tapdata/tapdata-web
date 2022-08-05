<template functional>
  <div
    class="empty-wrap"
    :class="{
      'empty-small': props.small,
      'empty-large': props.large
    }"
  >
    <div class="empty-image">
      <slot name="image">
        <svg width="111" height="92" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111 92">
          <defs>
            <linearGradient x1="52.045%" y1="100%" x2="52.045%" y2="-7.865%" id="a">
              <stop stop-color="#F3F4F6" stop-opacity="0" offset="0%" />
              <stop stop-color="#E4E6E9" offset="100%" />
            </linearGradient>
            <linearGradient x1="19.146%" y1="25.168%" x2="62.242%" y2="84.261%" id="b">
              <stop stop-color="#ECECEC" offset="0%" />
              <stop stop-color="#E4E6E9" offset="100%" />
            </linearGradient>
            <linearGradient x1="63.824%" y1="23.66%" x2="50%" y2="81.252%" id="c">
              <stop stop-color="#F3F3F3" offset="0%" />
              <stop stop-color="#DCDDDE" offset="100%" />
            </linearGradient>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="d">
              <stop stop-color="#EEE" offset="0%" />
              <stop stop-color="#D8D8D8" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="none" fill-rule="evenodd">
            <ellipse fill="url(#a)" fill-rule="nonzero" cx="55.5" cy="68.5" rx="55.5" ry="23.5" />
            <path fill="#D8D8D8" fill-rule="nonzero" d="m27.084 38.938 24.065-6.423L84 35.549l-26.937 5.65z" />
            <path
              fill="url(#b)"
              fill-rule="nonzero"
              d="m6.825 51.337.549 16.207 29.43 6.064V41.199L6.825 38.938z"
              transform="translate(20.259)"
            />
            <path
              fill="url(#c)"
              fill-rule="nonzero"
              d="M36.804 73.608 62.767 66l-.302-30.63-25.661 5.829"
              transform="translate(20.259)"
            />
            <path
              fill="url(#d)"
              fill-rule="nonzero"
              d="M30.89 32.515v11.181L6.825 38.938z"
              transform="translate(20.259)"
            />
            <path
              d="M30.294 15.56c8.182 14.033 15.354 19.7 21.517 17.001 9.245-4.048-7.898-13.144-8.443-.72.566 7.086 16.793 6.266 19.483 9.251 1.445 1.24 2.397 2.356 2.855 3.348"
              stroke="#B9BBC0"
              stroke-width=".784"
              stroke-dasharray=".784"
            />
            <path
              fill="#F6F7F8"
              fill-rule="nonzero"
              d="m57.063 41.199 9.165 15.62L91.6 47.357 82.724 35.37zM26.155 38.938l-5.896 10.367 30.398 6.471 6.406-14.577z"
            />
            <g fill-rule="nonzero">
              <path fill="#E4E6E9" d="m24 1.636 5.475 4.869L51 0zM32.439 9.195 51 0l-8.307 18z" />
              <path fill="#D7D8DA" d="m29.475 6.505-.44 7.479 3.48-4.815L51 0z" />
              <path fill="#DEE0E4" d="m29.035 13.984 6.161-2.513-2.775-2.279z" />
            </g>
          </g>
        </svg>
      </slot>
    </div>
    <p class="empty-desc">{{ props.description }}</p>
  </div>
</template>

<script>
export default {
  name: 'VEmpty',
  props: {
    small: Boolean,
    large: Boolean,
    description: {
      type: String,
      default: '暂无数据'
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-wrap {
  margin: 32px 0;
  font-size: 13px;
  line-height: 1.5715;
  text-align: center;
  color: rgba(0, 0, 0, 0.25);

  &.empty-small {
    margin: 8px 0;
    font-size: 12px;

    .empty-image {
      height: 40px;
    }
  }

  &.empty-large {
    font-size: 14px;
    .empty-image {
      height: 64px;
      margin-bottom: 16px;
    }
  }

  .empty-image {
    height: 48px;
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
