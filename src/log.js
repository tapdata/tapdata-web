/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/15/20
 * @description
 */
let counter = 0;
export default function() {
	if (localStorage.getItem('tapdata_debug')) {
		window['console'].groupCollapsed(++counter, ...arguments);
		window['console'].trace();
		window['console'].groupEnd();
	}
}
