export function setPermission(list) {
	let permissions = [];
	if (list) {
		list.forEach(permission => {
			if (permission.resources && permission.resources.length > 0) {
				permission.resources.forEach(res => {
					if (res.type === 'page') permissions.push(res);
				});
			}
		});
		sessionStorage.setItem('tapdata_permissions', JSON.stringify(permissions));
	}
	return permissions;
}

export function signOut() {
	let cookie = window.VueCookie;
	sessionStorage.removeItem('tapdata_permissions');
	cookie.delete('token');
	window.location.href = '/#/login';
}

export function toRegExp(s) {
	let arr = ['\\', '$', '(', ')', '*', '+', '.', '[', ']', '?', '^', '{', '}', '|', '-'];
	let word = s;
	for (let i = 0; i < arr.length; i++) {
		let str = '\\' + arr[i];
		word = word.replace(new RegExp(str, 'g'), '\\' + arr[i]);
	}
	return word;
}
