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

console.log('开始测试 ' + targets.length + ' 个域名...');

targets.forEach(function(t) {
  var t0 = Date.now();
  $httpClient.get({ url: t.url, timeout: 8 }, function(err, resp) {
    var ms = Date.now() - t0;
    var line;
    try {
      if (err) {
        line = '❌ ' + t.label + ' 连接失败';
      } else {
        line = (resp.status < 500 ? '✅' : '⚠️') + ' ' + t.label + ' HTTP' + resp.status + ' ' + ms + 'ms';
      }
    } catch(e) {
      line = '⚠️ ' + t.label + ' 异常';
    }
    rows.push(line);
    console.log(line);
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
