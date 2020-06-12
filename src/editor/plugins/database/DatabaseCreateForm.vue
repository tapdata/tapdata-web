<template>
	<Drawer :visible.sync="visible" title="新建数据库">
		<form-builder v-model="model" :config="config"></form-builder>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" @click="submit">Enter</el-button>
			<el-button size="mini" @click="visible = false">Cancel</el-button>
		</span>
	</Drawer>
</template>

<script>
import Drawer from "@/components/Drawer";

export default {
	name: "DatabaseCreateForm",
	components: {
		Drawer
	},
	data() {
		return {
			visible: false,

			model: {
				title: "db",
				type: "",
				power: 0,
				password: "",
				account: "",
				address: "",
				port: ""
			},
			config: {
				items: [
					{
						type: "input",
						field: "title",
						label: "连接名称",
						required: true
					},
					{
						type: "select",
						field: "type",
						label: "数据库类型",
						options: [
							{ label: "选项一", value: 1 },
							{ label: "选项二", value: 2 }
						],
						required: true
					},
					{
						type: "radio",
						field: "power",
						label: "数据库权限",
						border: true,
						options: [
							{ label: "允许读写", value: 0 },
							{ label: "仅限读取", value: 1 },
							{ label: "仅限写入", value: 2 }
						],
						required: true
					},
					{
						type: "input",
						field: "address",
						label: "数据库地址",
						rules: [
							{
								required: true,
								validator: (rule, value, callback) => {
									let port = this.config["port"];
									if (!value || !value.trim()) {
										callback(new Error("数据库地址不能为空"));
									} else if (!port || !port.trim()) {
										callback(new Error("端口不能为空"));
									} else {
										callback();
									}
								}
							}
						],
						appendSlot: h => {
							let self = this;
							return h("FbInput", {
								props: {
									value: self.config["port"],
									config: {
										placeholder: "端口"
									}
								},
								on: {
									input(val) {
										self.config["port"] = val;
									}
								}
							});
						}
					},
					{
						type: "input",
						field: "name",
						label: "数据库名称",
						required: true
					},
					{
						type: "input",
						field: "account",
						label: "账号",
						required: true
					},
					{
						type: "input",
						field: "password",
						label: "密码",
						required: true,
						domType: "password",
						showPassword: true
					}
				]
			}
		};
	},
	methods: {
		show() {
			this.visible = true;
		},
		submit() {}
	}
};
</script>

<style></style>
