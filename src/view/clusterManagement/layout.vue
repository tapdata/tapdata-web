<template>
	<div class="tapHeader">
		<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
			<el-menu-item index="1"
				><i class="icon iconfont iconjiqunzhuangtai"></i>{{ $t('message.serviceCluMange') }}</el-menu-item
			>
			<el-menu-item index="2"><i class="icon iconfont iconrizhi"></i>{{ $t('message.statusLog') }}</el-menu-item>
		</el-menu>
		<!-- <el-select v-model="langType" class="changeLangType" size="mini" @change="changeLangType">
          <el-option value="en" label="English"></el-option>
          <el-option value="cn" label="中文简体"></el-option>
          <el-option value="tc" label="中文繁體"></el-option>
    </el-select> -->
		<div class="main">
			<router-view />
			<!-- <el-row class="fun_area">
        <el-col :span="8">
          <div class="demo-input-suffix">
            <span>名称搜索</span>
            <el-input
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              clearable
              v-model="sourch">
            </el-input>
          </div>
        </el-col>
      </el-row> -->
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			activeIndex: '1',
			langType: 'en'
		};
	},
	methods: {
		handleSelect(key) {
			if (key === '1') {
				this.$router.push({ name: 'clusterManagement' });
			} else if (key === '2') {
				this.$router.push({ name: 'dailyRecord' });
			}
		}
		// changeLangType(type){
		//   localStorage.setItem('locale',type);
		//   this.$i18n.locale = type;
		// }
	}
};
</script>
<style lang="less" scoped>
.tapHeader {
	width: 100%;
	height: 100%;
	.el-menu-demo {
		height: 40px;
		border-bottom: 0;
		background: #f9f9f9;
		.el-menu-item {
			height: 40px;
			line-height: 40px;
			border-bottom: 0;
			border-top: 2px solid transparent;
		}
		.is-active {
			background-color: #fff;
			border-top: 2px solid #409eff;
			border-bottom: 0 !important;
		}
	}
	.changeLangType {
		width: 120px;
		float: right;
		z-index: 1;
	}
	.main {
		// height: 500px;
		height: calc(100% - 40px);
	}
}
</style>
