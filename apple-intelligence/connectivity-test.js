/**
 * Apple Intelligence 连通性测试
 *
 * 并发请求插件覆盖的全部 6 个域名，检测它们是否能通过当前代理访问。
 * 在 Loon 面板页显示结果；也可在脚本列表里手动触发。
 *
 * 判断逻辑：
 *   ✅ 收到任意 HTTP 响应（包括 4xx）→ 代理链路通，4xx 是服务器拒绝而非网络故障
 *   ❌ 连接超时 / 拒绝连接 → 代理未生效或节点挂了
 */

var TIMEOUT = 8; // 秒

var targets = [
  { label: 'apple-relay.apple.com',       url: 'https://apple-relay.apple.com/' },
  { label: 'apple-relay.cloudflare.com',  url: 'https://apple-relay.cloudflare.com/' },
  { label: 'apple-relay.fastly-edge.com', url: 'https://apple-relay.fastly-edge.com/' },
  { label: 'cp4.cloudflare.com',          url: 'https://cp4.cloudflare.com/' },
  { label: 'guzzoni.apple.com',           url: 'https://guzzoni.apple.com/' },
  { label: 'api.smoot.apple.com',         url: 'https://api.smoot.apple.com/' },
];

var pending = targets.length;
var rows = new Array(targets.length);

for (var i = 0; i < targets.length; i++) {
  (function(t, idx) {
    var t0 = Date.now();
    $httpClient.get(
      { url: t.url, timeout: TIMEOUT },
      function(err, resp) {
        var ms = Date.now() - t0;
        if (err) {
          // 连接失败：超时或节点拒连
          rows[idx] = '❌ ' + t.label + '\n   ' + (err || '连接超时');
        } else {
          // 收到响应即视为连通（4xx 是正常的，无需凭证）
          var icon = resp.status < 500 ? '✅' : '⚠️';
          rows[idx] = icon + ' ' + t.label + '\n   HTTP ' + resp.status + ' · ' + ms + 'ms';
        }
        pending--;
        if (pending === 0) finish();
      }
    );
  })(targets[i], i);
}

function finish() {
  var allOk = rows.every(function(r) { return r.indexOf('❌') !== 0; });
  var summary = allOk
    ? '✅ 全部域名可达，分流正常'
    : '❌ 部分域名不可达，请换节点';
  var body = rows.join('\n') + '\n(HTTP 4xx = 服务器可达，属正常)';

  $notification.post('Apple Intelligence 连通性', summary, body);
  $done({ title: 'Apple Intelligence 连通性', content: body });
}
