module.exports = function (url, token) {
  let javaTemplate = `public static void main(String[] args) {
  String url = "{{url}}";
  String access_token = "{{access_token}}";
  String param = "";
  String result1 = doGet(url, access_token, param);
  System.out.println(result1);
  String result2 = doPost(url+"/find", access_token, param);
  System.out.println(result2);
}
	
public static String doGet(String url, String access_token, String param) {
  try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    StringBuilder urlBuilder = new StringBuilder(url);
    urlBuilder.append("?access_token=").append(access_token);
    urlBuilder.append("&filter=").append(URLEncoder.encode(param, StandardCharsets.UTF_8.name()));
    HttpGet httpGet = new HttpGet(urlBuilder.toString());
    RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5000)
      .setConnectionRequestTimeout(5000)
      .setSocketTimeout(15000).build();
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
	
public static String doPost(String url, String access_token, String reqBody) {
  try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    StringBuilder urlBuilder = new StringBuilder(url);
    urlBuilder.append("?access_token=").append(access_token);
    RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(5000)
      .setConnectionRequestTimeout(5000)
      .setSocketTimeout(15000).build();
    HttpPost httpPost = new HttpPost(urlBuilder.toString());
    httpPost.setHeader("content-type", "application/json;charset=UTF-8");
    httpPost.setConfig(requestConfig);
    httpPost.setEntity(new StringEntity(reqBody, Charset.defaultCharset()));


    CloseableHttpResponse response = httpClient.execute(httpPost);
    StatusLine statusLine = response.getStatusLine();
    HttpEntity entity = response.getEntity();
    if (entity != null) {
      return EntityUtils.toString(entity, CharEncoding.UTF_8);
    } else {
      throw new RuntimeException("request url:" + url + " fail,status code is : " + statusLine.getStatusCode());
    }
  } catch (IOException e) {
    throw new RuntimeException(e);
  }
}`
    .replace('{{url}}', url)
    .replace('{{access_token}}', token)
  let jsTemplate = `import fetch from 'node-fetch';
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
})`
    .replace('{{url}}', url)
    .replace('{{access_token}}', token)
  let pythonTemplate = `import requests

url = "{{url}}"
access_token = "{{access_token}}";
param = {} # for example: param={'page':1,'limit':20}
headers = {'access_token': access_token}

result1 = requests.get(url, params=param, headers=headers)	
print(result1.text)
result2 = requests.post(url + "/find", json=param, headers=headers)
print(result2.text)`
    .replace('{{url}}', url)
    .replace('{{access_token}}', token)
  return {
    java: javaTemplate,
    javascript: jsTemplate,
    python: pythonTemplate,
  }
}
