<template>
	<div class="dataflow-upload">
		<div class="dataflow-head">{{ $t('dataFlow.import') }}</div>
		<div class="dataflow-radio">
			<el-radio v-model="upsert" :label="1">{{ $t('dataFlow.overWrite') }}</el-radio>
			<el-radio v-model="upsert" :label="0">{{ $t('dataFlow.skipData') }}</el-radio>
		</div>
		<div class="dataflow-radio">
			<el-tag
				size="mini"
				class="SelectClassify-tag"
				closable
				v-for="item in tagList"
				v-bind:key="item.value"
				@close="handleCloseTag(item)"
				>{{ item.value }}</el-tag
			>
			<span @click="handleClassify" class="classify">设置分类</span>
		</div>

		<el-upload
			class="upload-demo"
			:action="action"
			:accept="accept"
			:on-success="handleSuccess"
			:before-remove="handleRemove"
			:on-error="handleError"
			:file-list="fileList"
		>
			<el-button type="primary" plain size="small">{{ $t('dataFlow.upload') }}</el-button>
		</el-upload>
		<SelectClassify
			ref="SelectClassify"
			:dialogVisible="dialogVisible"
			type="dataflow"
			:oldTagList="tagList"
			v-on:dialogVisible="handleDialogVisible"
			v-on:operationsClassify="handleOperationClassify"
		></SelectClassify>
		<div v-show="status" class="tooltip">
			{{ $t('dataFlow.uploadOK') }} ,<router-link to="/dataFlows"> {{ $t('dataFlow.uploadInfo') }}</router-link>
		</div>
	</div>
</template>

<script>
import SelectClassify from './SelectClassify';
export default {
	components: { SelectClassify },
	data() {
		return {
			fileList: [],
			action: '',
			upsert: 1,
			accept: '.gz',
			status: false,
			tagList: [],
			dialogVisible: false
		};
	},
	created() {
		this.action =
			window.location.protocol +
			'//' +
			window.location.hostname +
			':' +
			window.location.port +
			'/api/MetadataInstances/upload?upsert=' +
			this.upsert;
	},

	watch: {
		upsert: {
			deep: true,
			handler() {
				this.action =
					window.location.protocol +
					'//' +
					window.location.hostname +
					':' +
					window.location.port +
					'/api/MetadataInstances/upload?upsert=' +
					this.upsert +
					'listtags=' +
					this.tagList;
			}
		}
	},
	methods: {
		handleDialogVisible() {
			this.dialogVisible = false;
		},
		handleClassify() {
			this.dialogVisible = true;
		},
		handleOperationClassify(listtags) {
			this.tagList = listtags;
		},
		handleCloseTag(data) {
			this.tagList.map((k, index) => {
				if (k.id === data.id) {
					this.tagList.splice(index, 1);
				}
			});
		},
		handleSuccess() {
			this.status = true;
		},
		handleError() {
			this.status = false;
			this.$message.error(this.$t('dataFlow.uploadError'));
		},
		handleRemove() {
			return false;
		}
	}
};
</script>

<style lang="less" scoped>
.dataflow-upload {
	width: 600px;
	margin: 0 auto;
}
.dataflow-head {
	width: 140px;
	line-height: 48px;
	font-size: 24px;
	font-weight: 400;
	color: rgba(0, 0, 0, 1);
	margin-bottom: 30px;
	margin-top: 120px;
}
.dataflow-radio {
	margin-top: 50px;
	margin-bottom: 50px;
}
.tooltip {
	height: 20px;
	font-size: 14px;
	color: rgba(102, 102, 102, 1);
	line-height: 43px;
	margin-top: 20px;
	a {
		color: #48b6e2;
	}
}
.classify {
	display: inline-block;
	color: #48b6e2;
	font-size: 12px;
	cursor: pointer;
}
</style>
<style>
.dataflow-upload .el-upload-list {
	margin-top: 30px;
}
.dataflow-upload .el-icon-close {
	display: none;
}
.dataflow-upload .el-upload-list__item:hover .el-icon-close {
	opacity: 0;
}
</style>
