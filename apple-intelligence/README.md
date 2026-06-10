# Apple Intelligence 分流插件

把 Apple Intelligence / Private Cloud Compute / Siri 相关域名分流到代理节点，解决在受限网络下报「网络错误」的问题。

> 纯 `[Rule]` 分流，无 MITM，不改写任何请求。

## 域名清单

来自 Apple 官方文档 [support.apple.com/en-us/101555](https://support.apple.com/en-us/101555) 的 Apple Intelligence, Siri, and Search 章节：

| 域名 | 用途 |
|------|------|
| `apple-relay.apple.com` | Apple Intelligence Extensions |
| `apple-relay.cloudflare.com` | Private Cloud Compute |
| `apple-relay.fastly-edge.com` | Private Cloud Compute |
| `cp4.cloudflare.com` | Private Cloud Compute |
| `guzzoni.apple.com` | Siri / 听写 |
| `*.smoot.apple.com` | 搜索（Siri / Spotlight / Safari / News 等）|

## 安装

Loon → 插件 → 右上角 ➕ → 添加插件，粘贴链接：

```
https://cdn.jsdelivr.net/gh/ccfco/loon-plugins@main/apple-intelligence/AppleIntelligence.plugin
```

> 国内大陆用上面的 jsDelivr 链接。`raw.githubusercontent.com` 在大陆经常连不上，会导致详情页空白。

安装后会提示分别为三组配置策略：

| 组 | 域名 | 建议 |
|----|------|------|
| PCC 苹果中继 | apple-relay.apple.com / cp4.cloudflare.com | 代理（国内直连超时） |
| PCC CDN 中继 | apple-relay.cloudflare.com / fastly-edge.com | 代理或 DIRECT（国内可直连） |
| Siri / 搜索 | guzzoni.apple.com / smoot.apple.com | 代理或 DIRECT（看网络） |

## 验证是否生效

使用苹果智能的任意功能（写作工具、通知摘要等），然后在 Loon「请求记录」里搜 `apple-relay`，确认请求走了你的代理组而非 DIRECT。

## 维护说明

域名清单来自苹果官方文档，若苹果更新 [101555](https://support.apple.com/en-us/101555)，对照增删 `[Rule]` 即可。
