<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TransformLoading',

  props: ['show'],

  setup(props) {
    return () => {
      return (
        <transition name="el-fade-in-linear">
          <div v-show={props.show} class="transform-status align-center px-3 py-1 rounded-pill border">
            <svg viewBox="25 25 50 50" class="circular">
              <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
            </svg>
            <span class="ml-1 font-color-light">模型生成中</span>
          </div>
        </transition>
      )
    }
  }
})
</script>

<style lang="scss" scoped>
.transform-status {
  display: flex;
  position: absolute;
  height: 32px;
  top: 16px;
  right: 24px;
  z-index: 2;
  background: #fff;
  box-shadow: 0px 0px 30px rgb(0 0 0 / 6%);

  .circular {
    height: 16px;
    width: 16px;
    animation: loading-rotate 2s linear infinite;

    .path {
      animation: loading-dash 1.5s ease-in-out infinite;
      stroke-dasharray: 90, 150;
      stroke-dashoffset: 0;
      stroke-width: 4;
      stroke: map-get($color, primary);
      stroke-linecap: round;
    }
  }
}
</style>
