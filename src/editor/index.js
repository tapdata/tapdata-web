/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/25/20
 * @description
 */
import Editor from './editor';
import 'alertifyjs/build/css/alertify.min.css';
import 'alertifyjs/build/css/themes/default.min.css';
export default function(container){
	return new Editor(container);
}
