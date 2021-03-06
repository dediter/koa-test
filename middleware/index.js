const path = require('path')
const ip = require('ip')
const bodyParser = require('koa-bodyparser')  //解析json等格式
const nunjucks = require('koa-nunjucks-2')   //模板引擎
const staticFiles = require('koa-static')    //指定静态文件
const miSend = require('./mi-send')
// 引入日志中间件
const miLog = require('./mi-log')
// 引入请求错误中间件
const miHttpError = require('./mi-http-error')

module.exports = (app) => {
    // 应用请求错误中间件
    // app.use(miHttpError())
    app.use(miHttpError({
        errorPageFolder: path.resolve(__dirname, '../errorPage')
    }))
    // 注册日志中间件
    app.use(miLog({
        env: app.env,  // koa 提供的环境变量
        projectName: 'arsenal-server',
        appLogLevel: 'debug',
        dir: 'logs',
        serverIp: ip.address()
    }))
    app.use(staticFiles(path.resolve(__dirname, "../public")))

    app.use(nunjucks({
        ext: 'html',
        path: path.join(__dirname, '../views'),// 指定视图目录
        nunjucksConfig: {
            trimBlocks: true // 开启转义 防Xss
        }
    }));
    app.use(bodyParser())

    app.use(miSend())
    // 增加错误的监听处理
    app.on("error", (err, ctx) => {
        if (ctx && !ctx.headerSent && ctx.status < 500) {
            ctx.status = 500
        }
        if (ctx && ctx.log && ctx.log.error) {
            if (!ctx.state.logged) {
                ctx.log.error(err.stack)
            }
        }
    })
}