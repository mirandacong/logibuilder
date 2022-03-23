# LogiBuilder

## 本地启动

### 下载代码至本地并解压

### 安装nodejs及yarn

nodejs >= 14.17.5 及 yarn >= 1.22.11。 如已经满足，跳过此步骤。

1、下载[nodejs](https://nodejs.org/en/download/)相应版本并安装
2、安装完成后，使用管理员权限打开命令行工具，输入命令并运行：

```sh
corepack enable
```

### 首次启动前的设置

命令行进入代码所在目录。首次启动前，需要运行下方命令：

```sh
yarn
```

设置环境变量：

如果您的系统是Linux系统，则运行下方命令:

```sh
export NODE_OPTIONS = '--max-old-space-size=8192'
```

如果是Windows系统，则运行下方命令：

```sh
set NODE_OPTIONS = '--max-old-space-size=8192'
```

### 启动

在代码所在目录下，运行

```sh
yarn start
```

运行成功后，可看到提示信息：

> √ Compiled successfully.

打开浏览器，输入 http://localhost:4200/ 即可打开
