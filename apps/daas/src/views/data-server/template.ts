module.exports = {
  java: `public String doGet(String url, String token, String param) {
  try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    StringBuilder urlBuilder = new StringBuilder(url);
    urlBuilder.append("?access_token=").append(token);
    urlBuilder.append("&filter=").append(URLEncoder.encode(param, StandardCharsets.UTF_8.name()));
    HttpGet httpGet = new HttpGet(urlBuilder.toString());
    RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5000).setConnectionRequestTimeout(5000).setSocketTimeout(15000).build();
    httpGet.setConfig(requestConfig);
    
    CloseableHttpResponse response = httpClient.execute(httpGet);
    StatusLine statusLine = response.getStatusLine();
    int statusCode = statusLine.getStatusCode();
    if (statusCode < HttpStatus.SC_OK || statusCode >= HttpStatus.SC_MULTIPLE_CHOICES) {
      throw new RuntimeException("request url:" + url + " fail,status code is : " + statusCode);
    }
    HttpEntity entity = response.getEntity();
    if (entity != null)
      return EntityUtils.toString(entity, CharEncoding.UTF_8);
    else
      throw new RuntimeException("request url:" + url + " fail,status code is : " + statusLine.getStatusCode());
  } catch (IOException e) {
    throw new RuntimeException(e);
  }
}
    `,
  javascript: `import fetch from 'node-fetch';
async function get(url){
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function post(url,body){
  const response = await fetch(url,{
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
  });
  const data = await response.json();
  return data;
}
const url = '{{url}}';
const access_token = '{{access_token}}';
get(url + '?access_token='+access_token).then(data=>{
  console.info(data)
}).catch(err=>{
  console.error(err)
})
post(url + '/find?access_token='+access_token,{}).then(data=>{
  console.info(data)
}).catch(err=>{
  console.error(err)
})`,
  python: `import requests

url = ''
parms01 = {
  'key':'xxx'
}
ret = requests.get(url,params=parms01)
print(ret)
print(ret.text)
print(ret.json())`
}
