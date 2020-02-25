import axios from 'axios';
export default {
  patch (urlPath, params) {
    return axios.patch(urlPath, params);
  },
  findOne (urlPath, params) {
    params = params || {};
    return axios.get(urlPath + '/findOne', {params});
  },
  get (urlPath, params) {
    if (Array.isArray(params)) {
      return axios.get(urlPath + '/' + params.join('/'));
    }
    params = params || {};
    return axios.get(urlPath, {params});
  },
  delete (urlPath, id) {
    return axios.delete(`${urlPath}/${id}`);
  },
  post (urlPath, params) {
    return axios.post(urlPath, params);
  },
  count (urlPath, params) {
    return axios.get(urlPath + '/count', {params});
  }
};
