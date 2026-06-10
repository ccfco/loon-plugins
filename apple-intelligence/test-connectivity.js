var nodeName = ($environment.params && $environment.params.node) || null;

var domains = [
  { label: 'apple-relay.apple.com',       url: 'https://apple-relay.apple.com/',       ohttp: true  },
  { label: 'apple-relay.cloudflare.com',  url: 'https://apple-relay.cloudflare.com/',  ohttp: false },
  { label: 'apple-relay.fastly-edge.com', url: 'https://apple-relay.fastly-edge.com/', ohttp: false },
  { label: 'cp4.cloudflare.com',          url: 'https://cp4.cloudflare.com/',          ohttp: true  },
  { label: 'guzzoni.apple.com',           url: 'https://guzzoni.apple.com/',           ohttp: false },
  { label: 'api.smoot.apple.com',         url: 'https://api.smoot.apple.com/',         ohttp: false },
];

function probe(url, node, useOhttp) {
  return new Promise(function(resolve) {
    var opts = { url: url, timeout: 8000 };
    if (node !== null) opts.node = node;
    if (useOhttp) {
      opts.headers = { 'Content-Type': 'message/ohttp-req' };
      opts.body = '';
    }
    var cb = function(err, resp) {
      if (err) resolve({ ok: false, status: null });
      else      resolve({ ok: resp.status < 500, status: resp.status });
    };
    if (useOhttp) $httpClient.post(opts, cb);
    else          $httpClient.get(opts, cb);
  });
}

function row(label, r, isOhttp) {
  if (r.ok) {
    return '<b>' + label + ':</b> ✅ HTTP ' + r.status;
  } else if (isOhttp && r.status === null) {
    // OHTTP relays require Apple device attestation; scripts cannot satisfy it — expected timeout
    return '<b>' + label + ':</b> ⚠️ 无响应（OHTTP 需设备验证）';
  } else {
    return '<b>' + label + ':</b> 🚫' + (r.status ? ' HTTP ' + r.status : ' 超时');
  }
}

var proxyTests  = domains.map(function(d) { return probe(d.url, nodeName,  d.ohttp); });
var directTests = domains.map(function(d) { return probe(d.url, 'DIRECT',  d.ohttp); });

Promise.all(proxyTests.concat(directTests)).then(function(all) {
  var pRows = all.slice(0, domains.length);
  var dRows = all.slice(domains.length);

  // OHTTP domains always timeout from scripts (device attestation required); exclude them from ok check
  var allOk = pRows.every(function(r, i) { return domains[i].ohttp || r.ok; });
  var summary = allOk
    ? '可达域名全部正常，苹果智能应该可用 ✅'
    : '部分域名不可达，苹果智能可能受影响 ⚠️';

  var content = '<b>── 通过节点 ──</b></br>'
    + pRows.map(function(r, i) { return row(domains[i].label, r, domains[i].ohttp); }).join('</br>')
    + '</br><b>── 直连对比 ──</b></br>'
    + dRows.map(function(r, i) { return row(domains[i].label, r, domains[i].ohttp); }).join('</br>')
    + '</br>────────────────</br>'
    + '<font color=#CD5C5C><b>节点</b> ➟ ' + (nodeName || '（未从节点菜单触发）') + '</font></br>'
    + '<b>结论:</b> ' + summary + '</br>'
    + '<small>⚠️ 无响应 = OHTTP 中继需苹果设备认证，脚本测不到，属正常</small>';

  content = '<p style="text-align:center;font-family:-apple-system;font-size:large">' + content + '</p>';
  $done({ title: '🍎 苹果AI连通性', htmlMessage: content });
}).catch(function(e) {
  $done({ title: '🍎 苹果AI连通性', htmlMessage: '<p style="text-align:center">测试出错: ' + (e && e.message || String(e)) + '</p>' });
});
