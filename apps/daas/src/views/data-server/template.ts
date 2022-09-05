module.exports = {
  post: {
    java: `public String doGet(String url, String token, String param) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            StringBuilder urlBuilder = new StringBuilder(url);
            urlBuilder.append("?access_token=").append(token);
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
    }`,
    python: `import requests

	url = ''
	parms01 = {
		'key':'xxx'
	}
	ret = requests.get(url,params=parms01)
	print(ret)
	print(ret.text)
	print(ret.json())`
  },
  get: {
    java: `public String doPost(String url, String access_token, String reqBody) {
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
    }`,
    python: `import requests   
	
            url="" 
            body={"key1":"xxx","key2":"xxx"}
            r=requests.post(url=url,json=body)
            print(r)`
  }
}
