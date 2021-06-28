<template>
  <section class="down-install-page down-page">
    <main class="page-main block">
      <div class="title">Agent 下载与安装</div>
      <p class="title-text pt-10">
        Tapdata DFS 云版需要先在本地安装 agent 以确保连接数据库和数据传输服务的正常运行,
        您可以根据要安装服务器的类型在下方选择相应的类型进行下载安装
      </p>

      <div class="down-type">
        <div
          v-for="down in downType"
          :key="down.value"
          :class="{ active: type === down.value }"
          @click="chooseDownLoadType(down.value)"
        >
          <span>{{ down.name }}</span>
        </div>
      </div>

      <h4 class="s-title">Agent 环境要求</h4>
      <template v-if="type !== 'Docker'">
        <p class="title-text pt-3">
          tapdata agent 的运行依赖本地 java 环境，因此，在部署 agent 前你需要检查本地是否已经部署 java 环境，java
          环境的检测与安装办法请根参考下方提示：
        </p>
        <div class="text-style pt-5">请检查所部属环境是否已安装 java 环境:</div>
        <p class="box mt-20">java -version</p>
        <!-- <p class="padding-top30">java环境安装完毕后，即可开始安装tapdata agent</p> -->
      </template>
      <div v-else>
        <p class="title-text pt-3">
          在下一步的安装步骤中，我们提供了包含 java 环境的 docker 镜像，如果你希望使用自己 的镜像但其缺少 java
          环境，请联系你的 docker 镜像管理员，或前往下方的 docker 官网寻 找对应镜像
        </p>

        <div class="box mt-20">https://hub.docker.com/search</div>
      </div>

      <template v-if="type === 'windows'">
        <p class="pt-5">如果上方命令返回异常，则说明 java 环境可能未安装</p>
        <p class="pt-3">可通过登录下方的 java 官网下载对应安装包</p>
        <p class="box mt-5">https://www.java.com/zh-CN/download/</p>
      </template>
      <template v-if="type === 'Linux'">
        <p class="pt-8">如果上方命令返回异常，则说明 java 环境可能未安装</p>
        <div class="text-style pt-8">
          可参考下方的命令为本地安装 java 环境（本提示中的 openjdk 版本仅用于示例）：
        </div>
        <p class="box mt-5">yum -y install java-1.8.0-openjdk</p>
      </template>

      <p v-if="type === 'Docker'" class="pt-8">
        在确认 docker 镜像包含 java 环境后，即可开始安装 Tapdata agent
      </p>
      <p v-else class="pt-8">
        在本地 java 环境安装完毕后，即可开始安装 Tapdata agent
      </p>
    </main>
    <footer class="footer">
      <ElButton @click="cancel()">取消</ElButton>
      <ElButton type="primary" @click="handleNextSetp()">下一步</ElButton>
    </footer>
  </section>
</template>
<script>
export default {
  name: 'DownInstall',
  props: {
    downLoadType: {
      type: String
    }
  },
  data() {
    return {
      type: this.downLoadType || '',
      downType: [
        { name: 'Windows (64 bit)', value: 'windows' },
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' }
      ]
    }
  },

  methods: {
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.type = val
    },

    // 取消
    cancel() {
      this.$emit('nextStep', 'previousInstall', this.type)
    },

    // 下一步
    handleNextSetp() {
      console.log(this.downLoadType)
      this.$emit('nextStep', 'downloadInstall', this.type)
    }
  }
}
</script>
<style lang="scss" scoped>
.down-install-page {
  // position: relative;
  // width: 100%;
  // .page-main {
  // 	height: calc(100% - 80px);
  // 	padding: 0 20% 100px 15%;
  // 	box-sizing: border-box;
  // 	overflow: auto;
  // }
  .down-type {
    padding: 50px 0;
    div {
      position: relative;
      display: inline-block;
      overflow: hidden;
      margin-right: 20px;
      padding: 10px 50px;
      font-size: 12px;
      cursor: pointer;
      color: #666;
      border: 1px solid #dedee4;
      border-radius: 3px;
    }
    .active {
      border: 1px solid map-get($color, primary);
      background-color: map-get($color, primary);
      color: #fff;
    }
  }
  .page-main {
    .box {
      padding: 10px 20px;
      background-color: #fafafa;
    }
  }
}
</style>
