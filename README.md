# loon-plugins

我自用的 [Loon](https://nsloon.app/) 插件合集。每个插件一个独立目录，含 `.plugin` 本体和说明。

## 插件清单

| 插件 | 说明 | 类型 | 安装链接 |
|------|------|------|---------|
| [Apple Intelligence 分流](apple-intelligence/) | 把苹果智能 / PCC / Siri 域名分流到代理，解决「网络错误」 | 纯 `[Rule]`，无 MITM | `https://raw.githubusercontent.com/ccfco/loon-plugins/main/apple-intelligence/AppleIntelligence.plugin` |

## 安装方式

Loon 里 **插件 → 右上角 ➕ → 添加插件**，粘贴对应的 raw 链接即可。带分流规则的插件，安装后 Loon 会弹一条「PROXY 未指定」通知，**点一下它、选成自己的节点组**就好（只需一次，之后不再提醒）。这是所有走代理的 Loon 插件的统一交互，作者无法替你预填。

## 目录约定

```
loon-plugins/
├── README.md                  # 本文件，插件总索引
└── <plugin-name>/             # 每个插件一个目录
    ├── *.plugin               # 插件本体
    ├── README.md              # 该插件的详细说明与排错
    └── (可选) scripts/、icon 等资源
```

新增插件时：建独立目录、放 `.plugin` + `README.md`，并在上面「插件清单」表里加一行。
