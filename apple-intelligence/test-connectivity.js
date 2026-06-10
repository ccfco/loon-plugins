/*
 * 苹果AI连通性测试
 * 检查节点是否能访问 Apple Intelligence / Private Cloud Compute 域名
 * apple-relay.apple.com 和 cp4.cloudflare.com 是 OHTTP 中继，
 * 需要用 POST + Content-Type: message/ohttp-req 才能得到服务器响应，
 * 普通 GET 请求会被服务器静默丢弃（超时）。
 */

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

function row(label, r) {
  return '<b>' + label + ':</b> ' + (r.ok ? '✅' : '🚫') + (r.status ? ' HTTP ' + r.status : ' 超时');
}

var proxyTests  = domains.map(function(d) { return probe(d.url, nodeName,  d.ohttp); });
var directTests = domains.slice(0, 2).map(function(d) { return probe(d.url, 'DIRECT', d.ohttp); });

Promise.all(proxyTests.concat(directTests)).then(function(all) {
  var pRows = all.slice(0, domains.length);
  var dRows = all.slice(domains.length);

  var allOk = pRows.every(function(r) { return r.ok; });
  var summary = allOk ? '全部可达，苹果智能应该正常 ✅' : '部分域名不可达，苹果智能可能受影响 ⚠️';

  var content = '<b>── 通过节点 ──</b></br>'
    + pRows.map(function(r, i) { return row(domains[i].label, r); }).join('</br>')
    + '</br><b>── 直连对比（前两条）──</b></br>'
    + dRows.map(function(r, i) { return row(domains[i].label + ' 直连', r); }).join('</br>')
    + '</br>────────────────</br>'
    + '<font color=#CD5C5C><b>节点</b> ➟ ' + (nodeName || '（未从节点菜单触发）') + '</font></br>'
    + '<b>结论:</b> ' + summary;

  content = '<p style="text-align:center;font-family:-apple-system;font-size:large">' + content + '</p>';
  $done({ title: '🍎 苹果AI连通性', htmlMessage: content });
}).catch(function(e) {
  $done({ title: '🍎 苹果AI连通性', htmlMessage: '<p style="text-align:center">测试出错: ' + (e && e.message || String(e)) + '</p>' });
});
