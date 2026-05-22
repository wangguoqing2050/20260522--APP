// Edge Function: 代理 CloudBase 数据库读写
var ENV_ID = 'punch-clock-d0gf4qatw6ea7beae';

export default async function onRequest(context) {
  var req = context.request;
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  var corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  var body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  var action = body.action;
  var token = body.token;
  var collection = body.collection;

  if (!action || !token || !collection) {
    return new Response(JSON.stringify({ error: 'Missing required fields: action, token, collection' }), {
      status: 400,
      headers: corsHeaders
    });
  }

  var reqHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  try {
    var url, method, reqBody;

    if (action === 'read') {
      url = 'https://' + ENV_ID + '.api.tcloudbasegateway.com/api/v1/database/' + collection + '/read';
      method = 'POST';
      reqBody = JSON.stringify(body.query ? { query: body.query } : {});
    } else if (action === 'add') {
      url = 'https://' + ENV_ID + '.api.tcloudbasegateway.com/api/v1/database/' + collection + '/add';
      method = 'POST';
      reqBody = JSON.stringify({ data: body.data });
    } else if (action === 'update') {
      url = 'https://' + ENV_ID + '.api.tcloudbasegateway.com/api/v1/database/' + collection + '/update';
      method = 'PATCH';
      reqBody = JSON.stringify({ query: body.query, data: body.data });
    } else {
      return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), {
        status: 400,
        headers: corsHeaders
      });
    }

    var response = await fetch(url, {
      method: method,
      headers: reqHeaders,
      body: reqBody
    });

    var data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
