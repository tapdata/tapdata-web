<template>
	<div class="e-link-wrap">

		<el-form label-position="right" label-width="150px" :model="model" ref="form">

			<el-form-item label="Data write model:" required>
				<el-select v-model="model.writeModel" :placeholder="`Please select Data Write model`">
					<el-option
							v-for="(item, idx) in writeModels"
							:label="`${item.label}`"
							:value="item.value"
							v-bind:key="idx"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item label="Association condition:">
				<table class="e-table">
					<thead>
						<tr>
							<th>Source Field</th>
							<th>Target Field</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item, idx) in model.condition" v-bind:key="idx">
							<td>
								<input type="text" v-model="item.source">
							</td>
							<td>
								<input type="text" v-model="item.target">
								<div class="e-action-bar">
									<el-button v-if="model.condition.length > 1" type="text" class="el-icon-close" size="mini" @click="removeCondition(idx)"></el-button>
									<el-button v-if="idx === model.condition.length - 1" type="text" class="el-icon-plus" size="mini" @click="addCondition"></el-button>
								</div>
							</td>

						</tr>
					</tbody>
				</table>
			</el-form-item>

		</el-form>

		<Mapping ref="mappingComp"></Mapping>
	</div>
</template>

<script>
	import {EditorEventType} from "../../editor/lib/events";
	import Mapping from './components/Mapping';
	export default {
		name: "Link",
		components: {Mapping},

		data(){
			return {

				writeModels: [{
					label: 'Append into Target',
					value: 'append'
				}, {
					label: 'Match and Merage or Insert New',
					value: 'upsert'
				}, {
					label: 'Match and Merage',
					value: 'update'
				}, {
					label: 'Match then Embed as Array in target',
					value: 'match_embed'
				}],

				model: {
					writeModel: 'upsert',
					condition: [{
						source: '',
						target: ''
					}]
				}
			};
		},

		watch: {
			model: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.getData());
				}
			}
		},

		mounted() {
			let self = this;
			self.$on(EditorEventType.RESIZE, () => {
				self.$refs.mappingComp.$emit(EditorEventType.RESIZE);
			});

			this.$on(EditorEventType.HIDE, () => {
				this.$refs.mappingComp.hide();
			});
			this.$on(EditorEventType.SHOW, () => {
				this.$refs.mappingComp.show();
			});
		},

		methods: {
			removeCondition(idx) {
				this.model.condition.splice(idx, 1);
				this.$emit(EditorEventType.RESIZE);
			},
			addCondition(){
				this.model.condition.push({source: '', target: ''});
				this.$emit(EditorEventType.RESIZE);
			},

			setData(data){
				if( data ){
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
				this.$emit(EditorEventType.RESIZE);
			},
			getData(){
				return JSON.parse(JSON.stringify(this.model));
			}
		},

		destroyed() {
		}
	};
</script>

<style lang="less" scoped>

	.e-link-wrap {
		height: 100%;

		.e-table {
			display: inline-block;
			font-size: 0.9em;
			color: #606266;

			thead {
				background: whitesmoke;
			}
			th {
				font-weight: normal;
			}
			tr, td, th {
				border-collapse: collapse;
				border: 1px solid #ccc;
			}
			td {
				position: relative;
			}

			input {
				color: #606266;
				width: 90px;
				height: 20px;
				outline: none;
				border: none;
				padding: 0 10px;
			}

			.e-action-bar {
				position: absolute;
				right: -56px;
				top: 0;
				width: 50px;
			}
		}
	}
</style>
<style lang="less">
	.e-link-wrap .el-form .el-radio-group{
		display: flex;
		justify-content: center;
		align-items: baseline;
		flex-flow: column;
		padding-left: 55px;
	}
</style>
