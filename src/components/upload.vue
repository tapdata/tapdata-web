<template>
	<div class="dataflow-upload">
		<div class="dataflow-head">{{ $t("dataFlow.import") }}</div>
		<div class="dataflow-radio">
			<el-radio v-model="upsert" :label="1">{{ $t("dataFlow.overWrite") }}</el-radio>
			<el-radio v-model="upsert" :label="0">{{ $t("dataFlow.skipData") }}</el-radio>
		</div>
		<el-upload
			class="upload-demo"
			:action="action"
			:on-preview="handlePreview"
			:on-remove="handleRemove"
			:file-list="fileList"
		>
			<el-button size="small">{{ $t("dataFlow.upload") }}</el-button>
		</el-upload>
	</div>
</template>

<script>
export default {
	data() {
		return {
			fileList: [],
			action: "",
			upsert: 1
		};
	},
	created() {
		this.action =
			window.location.protocol +
			"//" +
			window.location.hostname +
			":" +
			window.location.port +
			"/api/MetadataInstances/upload?upsert=" +
			this.upsert;
	},
	watch: {
		upsert: {
			deep: true,
			handler() {
				this.action =
					window.location.protocol +
					"//" +
					window.location.hostname +
					":" +
					window.location.port +
					"/api/MetadataInstances/upload?upsert=" +
					this.upsert;
			}
		}
	},
	methods: {
		handleRemove(file, fileList) {},
		handlePreview(file) {}
	}
};
</script>

<style>
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
	margin-top: 240px;
}
.dataflow-radio {
	margin-top: 50px;
	margin-bottom: 50px;
}
</style>
