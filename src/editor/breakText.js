/**
 * @author fannie
 * @date 22/5/20
 * @description
 */

import joint from './lib/rappid/rappid';
export default {
  breakText:function (text, width) {
    let str = joint.util.breakText(text, { width: width, height: 20 }, { 'font-size': 12 }, { hyphen: '^$', ellipsis: true });
    if( str === text ){
      return str;
    } else {
      let before = joint.util.breakText(text,
        { width: width/2, height: 20 },
        { 'font-size': 12 },
        {hyphen: '^$'});
      let after = text.substr(before.length).split('').reverse().join('');
      after = joint.util.breakText(after,
        { width: width/2, height: 20 },
        { 'font-size': 12 },
        {hyphen: '^$'});
      after = after.split('').reverse().join('');
      return before + '...' + after;
    }
  }
};

