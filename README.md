# qq空间说说爬虫

### 前言

最近学习node，写了一个智障的爬虫。能够导出你所有有权限的好友的qq空间说说。→_→ 同学们都说我很无聊。

### 使用说明

#### 一、登录qq空间，导出cookie，存入config文件下，保存为user.json文件。

推荐使用[EditThisCookie](http://www.editthiscookie.com/)插件，方便进行cookie的导出。

#### 二、安装运行

```bash
  yarn && yarn start
```

爬虫会自动搜索你的qq好友，然后逐一进行爬取。保存到`/store`目录下，按照qq号进行分类。

并且还有自动更新cookie的功能。
