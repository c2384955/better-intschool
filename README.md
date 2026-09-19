# Better Intschool — Intschool

> 给 [shc.intschool.cn](https://shc.intschool.cn) 用的 Tampermonkey 用户脚本。

安装

1. 从浏览器官方商店装浏览器扩展 Tampermonkey（篡改猴/油猴）：
   - Chrome / Edge 推荐官方 Chrome 应用商店：
     <https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo>
   - Edge 也可以用官方加载项商店：
     <https://microsoftedge.microsoft.com/addons/detail/iikmkjmpaadaobahmlepeloendndfphd>
   - Firefox：<https://addons.mozilla.org/firefox/addon/tampermonkey/>
2. 打开 [better-intschool.user.js]
   (https://raw.githubusercontent.com/c2384955/better-intschool/main/better-intschool.user.js)
   → 篡改猴弹出安装页 → 点「安装」
   - 若浏览器把链接显示成一堆源代码：打开篡改猴面板 → 实用工具 → 从 URL 安装 → 粘贴上面的链接
   - 若脚本列表里出现两个同名的：把旧的那个禁用或删掉
4. 打开 <https://shc.intschool.cn> 并登录，功能就出现了

> 升级是自动的：装的是链接版时，篡改猴会按脚本里的 `@version` 定期检查更新。

## 功能

- 成绩查看与模拟：每门课的真实总评 + 单科 GPA；点成绩格改分，实时试算总评变化
- 目标 GPA 规划：输入目标 GPA，反推每门课期末考需要考多少分
- 截止日期提醒：筛选栏常驻 ⚠ 按钮，按科目列出未提交的在线任务
- 任务标记：把要复查的任务往上拖一下就算"未完成"，会持续提示
- 往年成绩与多年 GPA 走势：筛选栏「学年」下拉里切换，「显示 ▾ → G9-G12 总览」看G9-G12的趋势图

## 遇到问题

先刷新页面；
如果还不行，点计算>清空模拟
还不行就F12打开浏览器控制台，上部导航栏选“应用”，左侧导航栏“存储”，找到本地和会话存储空间，分别选中，点上面的“🚫”清除按钮。

打印报告，执行：

```js
__INTS_DIAG()
```

会生成一份自检报告，点「复制报告」发我邮件chace.chen.stu@dipont-hc.com，最好简要描述情况，感谢。

## 数据与隐私

- 只请求 `shc.intschool.cn` 同源的只读 GET 接口（与正常浏览页面同源同类），
  不修改服务器上的任何数据、不向任何第三方发送数据
- 分数、任务标记、模拟、目标 GPA 全部只存在你自己浏览器的 `localStorage` 里
- 自检报告中的 token 与 schoolId 只输出"有/无"，不输出明文

## License

[MIT](LICENSE)
