<template>
	<div class="e-data-filter">
		<el-form class="e-form" label-position="top" label-width="130px" :model="model" ref="form">

			<el-form-item :required="true" :label="$t('editor.cell.processor.dataFilter.form.name.label')" size="mini">
				<el-input
						v-model="model.name"
						:placeholder="$t('editor.cell.processor.dataFilter.form.name.placeholder')"></el-input>
			</el-form-item>

			<el-form-item
					:required="true"
					size="mini">
				<template slot="label">
					{{$t('editor.cell.processor.dataFilter.form.expression.label')}}
					<el-tooltip placement="right-end">
						<div slot="content">{{$t('editor.cell.processor.dataFilter.form.expression.labelTip')}}</div>
						<i class="e-primary el-icon-warning-outline"></i>
					</el-tooltip>
				</template>
				<el-input
						type="textarea"
						v-model="model.expression"
						rows="5"
						:placeholder="$t('editor.cell.processor.dataFilter.form.expression.placeholder')"></el-input>
			</el-form-item>

			<el-form-item
					size="mini"
					:label="$t('editor.cell.processor.dataFilter.form.expressionExample.label')">
				<div style="color: #888888; font-size: 0.8em;">
					{{$t('editor.cell.processor.dataFilter.form.expressionExample.tip')}}
					<div class="e-expression-demo">
						<span style="color: red;">(</span> record.gender
						<span style="color: #F5AF3F;">==</span> 0
						<span style="color: #F5AF3F;">&&</span> record.age
						<span style="color: #F5AF3F;">&gt;</span> 50
						<span style="color: red;">)</span>
						<span style="color: #F5AF3F;">|| </span>
						<span style="color: red;">(</span> record.age
						<span style="color: #F5AF3F;">&ge;</span>30
						<span style="color: #F5AF3F;">&&</span> record.salary
						<span style="color: #F5AF3F;">&le;</span> 10000
						<span style="color: red;">)</span>
					</div>
				</div>
			</el-form-item>

			<el-form-item :required="true" size="mini" :label="$t('editor.cell.processor.dataFilter.form.action.label')">
				<el-radio-group v-model="model.action">
					<el-radio-button label="discard">{{$t('editor.cell.processor.dataFilter.form.action.discard')}}</el-radio-button>
					<el-radio-button label="retain">{{$t('editor.cell.processor.dataFilter.form.action.retain')}}</el-radio-button>
				</el-radio-group>
			</el-form-item>

		</el-form>
	</div>
</template>

<script>
	export default {
		name: "DataFilterAttribute",

		data() {
			return {
				model: {
					name: 'DataFilter',
					expression: '',
					action: 'discard', // discard,retain
				}
			};
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			},
		},

		methods:{
			setData(data){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			}
		}
	};
</script>

<style lang="less" scoped>
	@primaryColor: #F5AF3F;

	.e-data-filter {
		.e-form {
			padding: 10px 20px;

			.e-primary{
				color: @primaryColor;
			}

			.el-input, .el-select, .el-textarea {
				max-width: 400px;
				width: 80%;
			}
		}
	}
</style>
