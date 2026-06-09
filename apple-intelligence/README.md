# Apple Intelligence 分流插件

把 Apple Intelligence（苹果智能）/ Private Cloud Compute / Siri 相关的几个域名**单独分流到你的代理节点**，解决已启用苹果智能的设备在受限网络（如中国大陆）下使用 AI 功能时一直报「网络错误」的问题。

> 纯 `[Rule]` 分流，**不需要 MITM 证书、不改写任何请求**，最干净安全。

## 它解决什么问题

苹果智能的实际推理走 **Private Cloud Compute（PCC）**，请求经由 OHTTP 中继发往 `apple-relay.*` 等域名。这些域名在国内网络下连不上，于是「写作工具」「通知摘要」「Genmoji」「图像游乐场」等功能直接报网络错误。本插件把这些域名指向你的代理组，请求就能正常发出。

## 适用前提

- 设备**已经能看到/开启苹果智能**（美版、港版等非国行，地区为支持区域）。本插件**只负责网络分流，不负责解锁资格**——苹果智能的开关在设备端（`eligibilityd` + 地区 + 语言），网络插件改不了。
- 国行设备（region code = CN）需要先用 地区 + 语言 + 美区 IP 的方式让苹果智能出现，再用本插件保证网络通畅。
- Loon 里已有一个可用的代理策略组。

## 域名清单（来源：Apple 官方）

来自 Apple 官方文档 [Use Apple products on enterprise networks](https://support.apple.com/en-us/101555) 的 **Apple Intelligence, Siri, and Search** 章节：

| 域名 | 端口/协议 | 用途 |
|------|-----------|------|
| `apple-relay.apple.com` | 443 TCP/UDP | Apple Intelligence Extensions |
| `apple-relay.cloudflare.com` | 443 TCP/UDP | Private Cloud Compute |
| `apple-relay.fastly-edge.com` | 443 TCP/UDP | Private Cloud Compute |
| `cp4.cloudflare.com` | 443 TCP/UDP | Private Cloud Compute |
| `guzzoni.apple.com` | 443 TCP | Siri / 听写请求 |
| `*.smoot.apple.com` | 443 TCP | 搜索（Siri / Spotlight / Lookup / Safari / News 等）|

## 安装

在 Loon 中 **插件 → 添加插件**，粘贴：

```
https://raw.githubusercontent.com/ccfco/loon-plugins/main/apple-intelligence/AppleIntelligence.plugin
```

安装时会弹出一个参数 **Policy**：填你 Loon 里**已存在的代理策略组名**（默认 `Proxy`）。比如你的节点组叫 `🚀 节点选择`，就填这个名字，否则规则会因为找不到组而失效。

## 验证是否生效

1. 安装后，进入「写作工具」或让 Siri 做一次需要云端的请求（如长文本改写、通知摘要）。
2. 若不再报网络错误、能正常返回结果，即生效。
3. 也可在 Loon 的「请求」日志里搜 `apple-relay`，确认这些请求命中了你的代理组而非 DIRECT。

## 排错

**仍然报网络错误？** 大概率是 **QUIC / HTTP3（UDP 443）漏走直连**——PCC 域名同时支持 UDP，如果你的节点不中继 UDP，QUIC 请求会绕过 TCP 分流。两种处理：

- **首选**：确认你的代理节点支持 UDP 转发（多数 SS / Trojan / VLESS / Hysteria 节点都支持）。
- **备选**：在 Loon 配置的 `[Rule]` 里加一条全局禁用 QUIC，强制回落 TCP：
  ```
  AND,((PROTOCOL,UDP),(DEST-PORT,443)),REJECT
  ```
  > 注意这会禁掉**所有** QUIC（可能影响 YouTube 等的 HTTP3 加速），按需开启。

**填了 Policy 还是没分流？** 检查填入的组名和 Loon 配置里的组名**完全一致**（含 emoji、空格、大小写）。

## 维护说明

- 域名清单可能随 iOS 版本变化。若苹果更新了 [101555](https://support.apple.com/en-us/101555)，对照「Apple Intelligence, Siri, and Search」章节增删 `[Rule]` 即可。
- 本插件不含脚本/MITM，无需随 iOS 升级维护证书或脚本兼容性。
