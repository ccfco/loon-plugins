/*
 * Apple Intelligence 连通性测试
 * 检查节点是否能访问 Apple Intelligence / Private Cloud Compute 域名
 * 参考：https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js
 */

var nodeName = $environment.params.node;

var targets = [
  { label: 'apple-relay.apple.com',       url: 'https://apple-relay.apple.com/' },
  { label: 'apple-relay.cloudflare.com',  url: 'https://apple-relay.cloudflare.com/' },
  { label: 'apple-relay.fastly-edge.com', url: 'https://apple-relay.fastly-edge.com/' },
  { label: 'cp4.cloudflare.com',          url: 'https://cp4.cloudflare.com/' },
  { label: 'guzzoni.apple.com',           url: 'https://guzzoni.apple.com/' },
  { label: 'api.smoot.apple.com',         url: 'https://api.smoot.apple.com/' },
];

var results = {};

function test(target) {
  return new Promise(function(resolve) {
    $httpClient.get({
      url: target.url,
      node: nodeName,
      timeout: 8000,
    }, function(err, resp) {
      if (err) {
        results[target.label] = '<b>' + target.label + ':</b> 不可达 🚫';
      } else {
        var ok = resp.status < 500;
        results[target.label] = '<b>' + target.label + ':</b> ' + (ok ? '可达 ✅' : '异常 ⚠️') + ' HTTP ' + resp.status;
      }
      resolve();
    });
  });
}

Promise.all(targets.map(test)).then(function() {
  var lines = targets.map(function(t) { return results[t.label]; });
  var allOk = lines.every(function(l) { return l.indexOf('🚫') === -1; });
  var summary = allOk ? '苹果智能应该可用 ✅' : '部分域名不可达，苹果智能可能受影响 ⚠️';

  var content = '------------------------------------</br>'
    + lines.join('</br></br>')
    + '</br>------------------------------------</br>'
    + '<font color=#CD5C5C><b>节点</b> ➟ ' + nodeName + '</font></br>'
    + '<b>结论:</b> ' + summary;

  content = '<p style="text-align:center;font-family:-apple-system;font-size:large">' + content + '</p>';

  $done({ title: '🍎 Apple Intelligence 连通性', htmlMessage: content });
});
