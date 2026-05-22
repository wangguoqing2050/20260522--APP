// Edge Function: 代理 CloudBase 匿名登录 & Token 刷新
var ENV_ID = 'punch-clock-d0gf4qatw6ea7beae';
var GATEWAY = ENV_ID + '.api.tcloudbasegateway.com';

export default async function onRequest(context) {
  var req = context.request;
  // 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-device-id'
      }
    });
  }

  var body = {};
  try { body = await req.json(); } catch (e) {}

  var resHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  var deviceId = body.deviceId || 'edgeone-default-device';
  var cloudHeaders = {
    'Content-Type': 'application/json',
    'x-device-id': String(deviceId)
  };

  try {
    var url, fetchBody;

    if (body.refresh_token) {
      url = 'https://' + GATEWAY + '/auth/v1/token';
      fetchBody = JSON.stringify({ refresh_token: body.refresh_token });
    } else {
      url = 'https://' + GATEWAY + '/auth/v1/signin/anonymously';
      fetchBody = '{}';
    }

    var response = await fetch(url, {
      method: 'POST',
      headers: cloudHeaders,
      body: fetchBody
    });

    var data = await response.json();

    if (!response.ok && data) {
      return new Response(JSON.stringify({
        error: data.error_description || data.error || ('HTTP ' + response.status),
        code: response.status
      }), {
        status: response.status,
        headers: resHeaders
      });
    }

    return new Response(JSON.stringify(data), { headers: resHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: resHeaders
    });
  }
}
