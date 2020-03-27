<template>
	<div>
		<div>
			<el-form label-width="100px" :data="formData">
				<el-row>
					<el-col :span="12">
						<el-form-item :label="$t('dataFlow.taskName')">
							<el-input
									:placeholder="$t('dataFlow.searchPlaceholder')" prefix-icon="el-icon-search"
									v-model="formData.name"></el-input>
						</el-form-item>
						<el-form-item :label="$t('dataFlow.taskName')">
							<el-radio-group v-model="formData.type">
								<el-radio-button label="上海"></el-radio-button>
								<el-radio-button label="北京"></el-radio-button>
								<el-radio-button label="广州"></el-radio-button>
								<el-radio-button label="深圳"></el-radio-button>
							</el-radio-group>
						</el-form-item>
						<el-form-item>

						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :label="$t('dataFlow.taskName')">
							<el-input type="textarea"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		name: "Setting.vue",
		data() {
			return {
				formData: {
					name: '',
					type: '',
				}
			};
		}
	};
</script>

<style scoped>

</style>
