<template>
	<div class="dataflow-upload">
		<div class="dataflow-head">{{ $t('dataFlow.import') }}</div>
		<div class="dataflow-radio">
			<el-radio v-model="upsert" :label="1">{{ $t('dataFlow.overWrite') }}</el-radio>
			<el-radio v-model="upsert" :label="0">{{ $t('dataFlow.skipData') }}</el-radio>
		</div>
		<div class="dataflow-radio">
			<el-tag :key="tag" v-for="tag in tagList" :closable="true" @close="handleClose(tag)">
				{{ tag.value }}<span style="cursor: pointer" @click="handleClose(tag)"> X </span>
			</el-tag>
			<span @click="handleClassify" class="classify">{{ $t('dataFlow.taskBulkTag') }}</span>
		</div>

		<el-upload
			class="upload-demo"
			ref="upload"
			:action="action"
			:accept="accept"
			:file-list="fileList"
			:auto-upload="false"
			:on-success="handleSuccess"
			:on-change="handleChange"
		>
			<el-button type="primary" plain slot="trigger" size="small">{{ $t('dataFlow.chooseFile') }}</el-button>
			<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">{{
				$t('dataFlow.upload')
			}}</el-button>
		</el-upload>
		<SelectClassify
			ref="SelectClassify"
			:dialogVisible="dialogVisible"
			:type="type"
			:tagLists="tagList"
			v-on:dialogVisible="handleDialogVisible"
			v-on:operationsClassify="handleOperationClassify"
		></SelectClassify>
		<div v-show="status" class="tooltip">
			{{ $t('dataFlow.uploadOK') }}
		</div>
		<!--		<div v-show="status" class="tooltip">-->
		<!--			{{ $t('dataFlow.uploadOK') }} ,<router-link :to="`/dataFlows?mapping=${mappingTemplate}`"> {{ $t('dataFlow.uploadInfo') }}</router-link>-->
		<!--		</div>-->
	</div>
</template>

<script>
import SelectClassify from '../components/SelectClassify';
// import factory from '@/api/factory';
// const MetadataInstance = factory('MetadataInstances');
export default {
	components: { SelectClassify },
	data() {
		return {
			type: '',
			fileList: [],
			action: '',
			upsert: 1,
			accept: '.gz',
			status: false,
			tagList: [],
			dialogVisible: false,
			mappingTemplate: 'cluster-clone',
			downType: ''
		};
	},
	created() {
		this.type = this.$route.query && this.$route.query.type ? this.$route.query.type : '';
		if (this.type === 'api') {
			this.downType = 'APIServer';
		} else {
			this.downType = 'dataflow';
		}
		// this.handlerUpload();
		// this.action =
		// 	window.location.protocol +
		// 	'//' +
		// 	window.location.hostname +
		// 	':' +
		// 	window.location.port +
		// 	'/api/MetadataInstances/upload?upsert=' +
		// 	this.upsert +
		// 	'&listtags=' +
		// 	JSON.stringify(this.tagList) +
		// 	'&type=' +
		// 	this.downType;
	},

	watch: {
		// upsert: {
		// 	deep: true,
		// 	handler() {
		// 		this.handlerUpload();
		// 		// this.action =
		// 		// 	window.location.protocol +
		// 		// 	'//' +
		// 		// 	window.location.hostname +
		// 		// 	':' +
		// 		// 	window.location.port +
		// 		// 	'/api/MetadataInstances/upload?upsert=' +
		// 		// 	this.upsert +
		// 		// 	'&listtags=' +
		// 		// 	JSON.stringify(this.tagList) +
		// 		// 	'&type=' +
		// 		// 	this.downType;
		// 	}
		// },
		// tagList: {
		// 	deep: true,
		// 	handler() {
		// 		this.handlerUpload();
		// 	}
		// }
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
		handleClose(data) {
			this.tagList.map((k, index) => {
				if (k.id === data.id) {
					this.tagList.splice(index, 1);
				}
			});
		},

		handleChange(file) {
			this.fileList = [file];
			this.action =
				window.location.protocol +
				'//' +
				window.location.hostname +
				':' +
				window.location.port +
				'/api/MetadataInstances/upload?upsert=' +
				this.upsert +
				'&listtags=' +
				JSON.stringify(this.tagList) +
				'&type=' +
				this.downType;
		},

		handleSuccess(response) {
			if (response.code === '110500') {
				this.status = false;
				this.$message.error(this.$t('dataFlow.uploadError'));
			} else {
				this.status = true;
			}
		},

		submitUpload() {
			// this.handlerUpload();
			this.$refs.upload.submit();
		}

		// handlerUpload() {
		// 	let formData = new FormData();
		// 	if (this.fileList.length) {
		// 		formData.append('file', this.fileList[0].file);
		// 	}

		// 	MetadataInstance.upload(this.upsert, this.downType, JSON.stringify(this.tagList), formData)
		// 		.then(() => {
		// 			this.status = true;
		// 		})
		// 		.catch(() => {
		// 			this.status = false;
		// 			this.$message.error(this.$t('dataFlow.uploadError'));
		// 		});
		// }
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
