var nodeName = ($environment.params && $environment.params.node) || null;

// apple-relay.apple.com and cp4.cloudflare.com are OHTTP relays that require
// Apple device attestation; no HTTP client can probe them — excluded from test.
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
      else      resolve({ ok: resp.status < 500, status: resp.status });
    });
  });
}

function row(label, r) {
  return '<b>' + label + ':</b> '
    + (r.ok ? '✅' : '🚫')
    + (r.status ? ' HTTP ' + r.status : ' 超时');
}

var proxyTests  = domains.map(function(d) { return probe(d.url, nodeName);  });
var directTests = domains.map(function(d) { return probe(d.url, 'DIRECT'); });

Promise.all(proxyTests.concat(directTests)).then(function(all) {
  var pRows = all.slice(0, domains.length);
  var dRows = all.slice(domains.length);

  var allOk = pRows.every(function(r) { return r.ok; });
  var summary = allOk
    ? '全部可达，苹果智能应该正常 ✅'
    : '部分域名不可达，苹果智能可能受影响 ⚠️';

  var content = '<b>── 通过节点 ──</b></br>'
    + pRows.map(function(r, i) { return row(domains[i].label, r); }).join('</br>')
    + '</br><b>── 直连对比 ──</b></br>'
    + dRows.map(function(r, i) { return row(domains[i].label, r); }).join('</br>')
    + '</br>────────────────</br>'
    + '<small>CDN 中继（cloudflare/fastly）国内直连也可达属正常；关键看 guzzoni/smoot 节点✅直连🚫</small></br>'
    + '<font color=#CD5C5C><b>节点</b> ➟ ' + (nodeName || '（未从节点菜单触发）') + '</font></br>'
    + '<b>结论:</b> ' + summary;

  content = '<p style="text-align:center;font-family:-apple-system;font-size:large">' + content + '</p>';
  $done({ title: '🍎 苹果AI连通性', htmlMessage: content });
}).catch(function(e) {
  $done({ title: '🍎 苹果AI连通性', htmlMessage: '<p style="text-align:center">测试出错: ' + (e && e.message || String(e)) + '</p>' });
});
