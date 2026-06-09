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

在 Loon 中 **插件 → 右上角 ➕ → 添加插件**，粘贴下面链接。

**推荐（国内可直连，走 jsDelivr CDN）：**

```
https://cdn.jsdelivr.net/gh/ccfco/loon-plugins@main/apple-intelligence/AppleIntelligence.plugin
```

**备用（GitHub 源站，国内大陆常被墙，可能装上后详情页空白）：**

```
https://raw.githubusercontent.com/ccfco/loon-plugins/main/apple-intelligence/AppleIntelligence.plugin
```

> ⚠️ **国内大陆务必用第一个 jsDelivr 链接。** `raw.githubusercontent.com` 在大陆网络下经常连不上，会导致 Loon「存了链接但下不到内容」→ 插件详情页一片空白（看起来像故障，其实是没下载下来）。换成 jsDelivr 镜像即可。jsDelivr 有 CDN 缓存，作者更新后偶尔要等一会儿才刷新。

安装后，**点进这个插件、或点一下 Loon 弹出的「PROXY 未指定」通知，把「策略」选成你自己的代理节点组**。这一步只需做一次。

> 插件里的规则策略统一写成 `PROXY`——这是 Loon 的官方机制，`PROXY` 代表「你在配置该插件时手动选择的策略组」。这是所有「走代理」的 Loon 插件的统一交互：作者无法替你预填，因为每台设备的节点组名字都不同。
>
> 参考：[Loon 官方插件文档 · 插件中规则的策略](https://nsloon.app/docs/Plugin/)。

## 一直收到「插件中的 PROXY 未指定」通知怎么办

如果 Loon 反复弹这条提醒：

> ⚠️ 插件中的 PROXY 未指定 ——『Apple Intelligence 分流』插件中的 PROXY 项未指派代理策略，请点击该通知进行指派

**这不是故障，也不是这个插件特有的问题。** 原因是插件规则里的 `PROXY` 占位符还处于「未指派」状态。Loon 的判定只有两档：**未指派 → 每次重载/联网都提醒；已指派 → 永久不再提醒**，中间没有「弹一次就停」。所以只要你一直没指派，它就一直弹（虽然此时它会偷偷回落到全局策略里的第一个节点，分流照常生效，但占位符仍算未指派）。

**正解（一步，最通用）：直接点那条通知 → 选你自己的节点组。** 选完即「已指派」，通知永久消失，不用编辑配置、不用碰任何文件。这就是 Loon 官方设计的标准做法。

<details>
<summary>进阶可选：在配置里预设默认策略（管文本配置的人才需要）</summary>

如果你习惯直接编辑 `.conf`，也可以在 `[Plugin]` 段给这条插件的导入行末尾加 `policy=` 参数，效果等同于提前指派好：

```
https://cdn.jsdelivr.net/gh/ccfco/loon-plugins@main/apple-intelligence/AppleIntelligence.plugin, policy=你的节点组名, tag=Apple Intelligence 分流, enabled=true
```

把 `你的节点组名` 换成你 Loon「策略」页里真实存在的组名。对普通用户来说，这比直接点通知更麻烦，按需使用即可。

</details>

## 临时开关整个插件

想一键停用/启用整个插件（这 6 条规则全部生效或全部停），**不用改插件**，Loon 自带总开关：

- **「插件」列表里**：进入 Loon「插件」页，找到本插件，那一行就有**启用开关**，关掉 = 整个插件停用。
- **配置文件里**：`[Plugin]` 导入行末尾加 `enabled=false`（停用）/ `enabled=true`（启用）。

## 关于「插件详情页空白 / 内容很少」（重要）

先分清两种「空白」：

- **完全空白，连说明文字都没有** → 多半是**插件内容没下载下来**，最常见原因是用了 `raw.githubusercontent.com` 而你的网络（如国内大陆）连不上。**换成上面的 jsDelivr 链接重新添加即可。**
- **只显示说明文字、规则没有逐条列出** → 这是**纯分流规则插件的正常现象，不是故障**。

为什么「只有说明文字」是正常的：Loon 的插件详情页只渲染「元信息 + 脚本(`[Script]`) + 复写 + 可配置参数(`[Argument]`)」。别的插件内容丰富是因为带脚本和大量参数；本插件**只有 `[Rule]` 分流规则 + 一个 `[Argument]` 开关（禁用 QUIC）**——分流规则不会逐条列出，它们汇入 Loon 全局的「规则」总计数里。

**判断生效请看下方「验证是否生效」，不要看详情页规则是否逐条罗列。**

## 验证是否生效

任选其一：

1. **看流量（最准）**：进入「写作工具」/ 通知摘要，或让 Siri 做一次云端请求；然后在 Loon「请求 / 抓包记录」里搜 `apple-relay`，确认这些请求**命中了你的代理组**而非 DIRECT。
2. **看功能**：苹果智能不再报网络错误、能正常返回结果。
3. **看规则计数**：安装前后对比 Loon 首页「规则」总数，应增加 6 条（若打开了「禁用 QUIC」开关则为 7 条）。

## 排错

**仍然报网络错误？** 大概率是 **QUIC / HTTP3（UDP 443）漏走直连**——PCC 域名同时支持 UDP，如果你的节点不中继 UDP，QUIC 请求会绕过 TCP 分流。两种处理：

- **首选**：确认你的代理节点支持 UDP 转发（多数 SS / Trojan / VLESS / Hysteria 节点都支持）。
- **备选**：打开本插件自带的 **「禁用 QUIC（UDP 443）」开关**（插件「设置」里，默认关闭），它会全局拒绝 QUIC、强制回落 TCP 走代理。等价于在配置里加这条规则：
  ```
  AND,((PROTOCOL,UDP),(DEST-PORT,443)),REJECT
  ```
  > 注意这会禁掉**所有** QUIC（可能影响 YouTube 等的 HTTP3 加速），所以默认关闭，按需开启。

**选了策略还是没分流 / 点进去空白？** 确认插件详情里「策略」已手动选成你的节点组；若整个插件内容显示空白，多半是规则策略字段非法（Loon 插件规则只接受 `DIRECT` / `REJECT`类 / `PROXY` 三种），本插件统一用 `PROXY`，正常应能解析。

## 维护说明

- 域名清单可能随 iOS 版本变化。若苹果更新了 [101555](https://support.apple.com/en-us/101555)，对照「Apple Intelligence, Siri, and Search」章节增删 `[Rule]` 即可。
- 本插件不含脚本/MITM，无需随 iOS 升级维护证书或脚本兼容性。
