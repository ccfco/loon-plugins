// 参考：$environment.params 在 generic 脚本里是触发时选中的节点/策略组
// node: $environment.params 告诉 $httpClient 走指定节点，不传则走默认
var policy = $environment.params;
console.log('触发策略: ' + JSON.stringify(policy));

var targets = [
  { label: 'apple-relay.apple.com',       url: 'https://apple-relay.apple.com/' },
  { label: 'apple-relay.cloudflare.com',  url: 'https://apple-relay.cloudflare.com/' },
  { label: 'apple-relay.fastly-edge.com', url: 'https://apple-relay.fastly-edge.com/' },
  { label: 'cp4.cloudflare.com',          url: 'https://cp4.cloudflare.com/' },
  { label: 'guzzoni.apple.com',           url: 'https://guzzoni.apple.com/' },
  { label: 'api.smoot.apple.com',         url: 'https://api.smoot.apple.com/' },
];

var rows = [];
var pending = targets.length;

targets.forEach(function(t) {
  var opts = { url: t.url, timeout: 8000 };
  if (policy) opts.node = policy;

  var t0 = Date.now();
  $httpClient.get(opts, function(err, resp) {
    var ms = Date.now() - t0;
    var line;
    try {
      if (err) {
        line = '❌ ' + t.label + ' (' + ms + 'ms)';
        console.log(line + ' err=' + JSON.stringify(err));
      } else {
        line = (resp.status < 500 ? '✅' : '⚠️') + ' ' + t.label + ' HTTP' + resp.status + ' ' + ms + 'ms';
        console.log(line);
      }
    } catch(e) {
      line = '⚠️ ' + t.label + ' 异常: ' + e.message;
      console.log(line);
    }
    rows.push(line);
    pending--;
    if (pending === 0) finish();
  });
});

function finish() {
  var allOk = rows.every(function(r) { return r.indexOf('❌') !== 0; });
  var summary = allOk ? '✅ 全部可达，分流正常' : '❌ 有域名不可达，请换节点';
  console.log('---');
  console.log(summary);
  $notification.post('Apple Intelligence 连通性', summary, rows.join('\n'));
  $done({ title: 'Apple Intelligence 连通性', content: rows.join('\n') });
}
