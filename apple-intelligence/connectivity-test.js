// 先测一个直连可达的域名（百度），确认 $httpClient 是否走代理
// 如果百度 OK 但 apple-relay 不 OK，说明直连；
// 如果百度也超时，说明 $httpClient 走了代理但节点有问题。

var probes = [
  { label: '[对照] baidu.com（直连可达）', url: 'https://www.baidu.com/', direct: true },
  { label: '[对照] google.com（需代理）',  url: 'https://www.google.com/', direct: false },
  { label: 'apple-relay.apple.com',        url: 'https://apple-relay.apple.com/' },
  { label: 'apple-relay.cloudflare.com',   url: 'https://apple-relay.cloudflare.com/' },
  { label: 'guzzoni.apple.com',            url: 'https://guzzoni.apple.com/' },
];

var rows = [];
var pending = probes.length;

console.log('诊断中...');

probes.forEach(function(p) {
  var t0 = Date.now();
  $httpClient.get({ url: p.url, timeout: 10 }, function(err, resp) {
    var ms = Date.now() - t0;
    var line;
    try {
      if (err) {
        line = '❌ ' + p.label + ' (' + ms + 'ms 失败)';
      } else {
        line = '✅ ' + p.label + ' HTTP' + resp.status + ' ' + ms + 'ms';
      }
    } catch(e) {
      line = '⚠️ ' + p.label + ' 异常';
    }
    rows.push(line);
    console.log(line);
    pending--;
    if (pending === 0) finish();
  });
});

function finish() {
  var baiduOk  = rows.some(function(r) { return r.indexOf('baidu') > -1 && r.indexOf('✅') === 0; });
  var googleOk = rows.some(function(r) { return r.indexOf('google') > -1 && r.indexOf('✅') === 0; });

  var diagnosis;
  if (!baiduOk && !googleOk) {
    diagnosis = '⚠️ $httpClient 走代理，但代理节点连不出去';
  } else if (baiduOk && !googleOk) {
    diagnosis = '⚠️ $httpClient 走直连（百度通 Google 不通），脚本测不了代理效果';
  } else if (baiduOk && googleOk) {
    diagnosis = '✅ $httpClient 走代理且代理正常';
  } else {
    diagnosis = '? 结果异常';
  }

  console.log('---');
  console.log('诊断：' + diagnosis);

  var body = rows.join('\n') + '\n\n诊断：' + diagnosis;
  $notification.post('Apple Intelligence 连通性', diagnosis, body);
  $done({ title: 'Apple Intelligence 连通性', content: body });
}
