interface UrlItem {
  method: string
  url: string
  last?: string
  canEdit?: boolean
  type?: string
}

interface TemplateParams {
  urlList: UrlItem[]
  token: Record<string, any>
}

export default function ({ urlList, token }: TemplateParams) {
  // Extract URLs from urlList
  const getUrl =
    urlList.find((item) => item.method === 'GET')?.url ||
    urlList.find((item) => item.type === 'DEFAULT_GET')?.url ||
    ''
  const postUrlItem = urlList.find(
    (item) => item.method === 'POST' || item.type === 'DEFAULT_POST',
  )
  const postUrl = postUrlItem ? postUrlItem.url + (postUrlItem.last || '') : ''
  const tokenUrl = urlList.find((item) => item.method === 'TOKEN')?.url || ''
  const accessToken = token?.access_token || ''

  const javaTemplate = `public static void main(String[] args) {
  // Token URL (OAuth2)
  String tokenUrl = "${tokenUrl}";

  // GET request URL
  String getUrl = "${getUrl}";

  // POST request URL
  String postUrl = "${postUrl}";

  // Access token (obtained from token endpoint)
  String access_token = "${accessToken}";

  String param = "";

  // GET request example
  String result1 = doGet(getUrl, access_token, param);
  System.out.println(result1);

  // POST request example
  String result2 = doPost(postUrl, access_token, param);
  System.out.println(result2);
}

public static String doGet(String url, String access_token, String param) {
  try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    StringBuilder urlBuilder = new StringBuilder(url);
    urlBuilder.append("?access_token=").append(access_token);
    if (param != null && !param.isEmpty()) {
      urlBuilder.append("&filter=").append(URLEncoder.encode(param, StandardCharsets.UTF_8.name()));
    }
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
}

// Get access token from OAuth2 token endpoint
public static String getAccessToken(String tokenUrl, String clientId, String clientSecret) {
  try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
    HttpPost httpPost = new HttpPost(tokenUrl);
    httpPost.setHeader("content-type", "application/x-www-form-urlencoded");

    List<NameValuePair> params = new ArrayList<>();
    params.add(new BasicNameValuePair("grant_type", "client_credentials"));
    params.add(new BasicNameValuePair("client_id", clientId));
    params.add(new BasicNameValuePair("client_secret", clientSecret));
    httpPost.setEntity(new UrlEncodedFormEntity(params));

    CloseableHttpResponse response = httpClient.execute(httpPost);
    HttpEntity entity = response.getEntity();
    if (entity != null) {
      String result = EntityUtils.toString(entity, CharEncoding.UTF_8);
      // Parse JSON to get access_token
      // JSONObject json = new JSONObject(result);
      // return json.getString("access_token");
      return result;
    }
    throw new RuntimeException("Failed to get access token");
  } catch (IOException e) {
    throw new RuntimeException(e);
  }
}`

  const jsTemplate = `import fetch from 'node-fetch';

// Token URL (OAuth2)
const tokenUrl = '${tokenUrl}';

// GET request URL
const getUrl = '${getUrl}';

// POST request URL
const postUrl = '${postUrl}';

// Current access token
const access_token = '${accessToken}';

// Get access token from OAuth2 token endpoint
async function getAccessToken(clientId, clientSecret) {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });
  const data = await response.json();
  return data.access_token;
}

// GET request
async function get(url, token) {
  const response = await fetch(url + '?access_token=' + token);
  const data = await response.json();
  return data;
}

// POST request
async function post(url, token, body) {
  const response = await fetch(url + '?access_token=' + token, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return data;
}

// Example: GET request
get(getUrl, access_token).then(data => {
  console.info('GET result:', data);
}).catch(err => {
  console.error('GET error:', err);
});

// Example: POST request
post(postUrl, access_token, { page: 1, limit: 20 }).then(data => {
  console.info('POST result:', data);
}).catch(err => {
  console.error('POST error:', err);
});

// Example: Get new token and make request
// getAccessToken('your_client_id', 'your_client_secret').then(token => {
//   return get(getUrl, token);
// }).then(data => {
//   console.info('Result with new token:', data);
// });`

  const pythonTemplate = `import requests

# Token URL (OAuth2)
token_url = "${tokenUrl}"

# GET request URL
get_url = "${getUrl}"

# POST request URL
post_url = "${postUrl}"

# Current access token
access_token = "${accessToken}"

# Get access token from OAuth2 token endpoint
def get_access_token(client_id, client_secret):
    response = requests.post(token_url, data={
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret
    })
    return response.json().get('access_token')

# GET request example
params = {'page': 1, 'limit': 20}  # Optional query parameters
headers = {'access_token': access_token}
result1 = requests.get(get_url, params=params, headers=headers)
print('GET result:', result1.text)

# POST request example
body = {'page': 1, 'limit': 20}
result2 = requests.post(post_url + '?access_token=' + access_token, json=body)
print('POST result:', result2.text)

# Example: Get new token and make request
# new_token = get_access_token('your_client_id', 'your_client_secret')
# result = requests.get(get_url, headers={'access_token': new_token})
# print('Result with new token:', result.text)`

  return {
    java: javaTemplate,
    javascript: jsTemplate,
    python: pythonTemplate,
  }
}
