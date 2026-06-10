var nodeName = ($environment.params && $environment.params.node) || null;

var domains = [
  { label: 'apple-relay.cloudflare.com',  url: 'https://apple-relay.cloudflare.com/'  },
  { label: 'apple-relay.fastly-edge.com', url: 'https://apple-relay.fastly-edge.com/' },
  { label: 'guzzoni.apple.com',           url: 'https://guzzoni.apple.com/'           },
  { label: 'api.smoot.apple.com',         url: 'https://api.smoot.apple.com/'         },
];

function probe(url, node) {
  return new Promise(function(resolve) {
    var opts = { url: url, timeout: 8000 };
    if (node !== null) opts.node = node;
    $httpClient.get(opts, function(err, resp) {
      if (err) resolve({ ok: false, status: null });
      else     resolve({ ok: resp.status < 500, status: resp.status });
    });
  });
}

Promise.all(domains.map(function(d) { return probe(d.url, nodeName); })).then(function(rows) {
  var allOk = rows.every(function(r) { return r.ok; });

  var lines = rows.map(function(r, i) {
    return '<b>' + domains[i].label + ':</b> '
      + (r.ok ? '✅' : '🚫')
      + (r.status ? ' HTTP ' + r.status : ' 超时');
  });
  lines.push('');
  lines.push('<font color=#CD5C5C><b>节点</b> ➟ ' + (nodeName || '（未从节点菜单触发）') + '</font>');
  lines.push('<b>结论:</b> ' + (allOk ? '全部可达 ✅' : '部分不可达 ⚠️'));

  var html = '<p style="text-align:center;font-family:-apple-system">' + lines.join('</br>') + '</p>';
  $done({ title: '🍎 苹果AI连通性', htmlMessage: html });
}).catch(function(e) {
  $done({ title: '🍎 苹果AI连通性', htmlMessage: '<p>测试出错: ' + (e && e.message || String(e)) + '</p>' });
});
