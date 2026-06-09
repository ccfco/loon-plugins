# loon-plugins

我自用的 [Loon](https://nsloon.app/) 插件合集。每个插件一个独立目录，含 `.plugin` 本体和说明。

## 插件清单

| 插件 | 说明 | 类型 | 安装链接 |
|------|------|------|---------|
| [Apple Intelligence 分流](apple-intelligence/) | 把苹果智能 / PCC / Siri 域名分流到代理，解决「网络错误」 | 纯 `[Rule]`，无 MITM | `https://raw.githubusercontent.com/ccfco/loon-plugins/main/apple-intelligence/AppleIntelligence.plugin` |

## 安装方式

Loon 里 **插件 → 添加插件**，粘贴对应的 raw 链接即可。部分插件安装时会让你填参数（如代理组名），按提示填即可。

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
