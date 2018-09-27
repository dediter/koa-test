const logger = require("./logger")
module.exports = (options) => {
    // return logger()
    const loggerMiddleware = logger(options)

    return (ctx, next) => {
        return loggerMiddleware(ctx, next)
            .catch((e) => {
                if (ctx.status < 500) {
                    ctx.status = 500;
                }
                ctx.log.error(e.stack);
                ctx.state.logged = true;
                ctx.throw(e);
            })
    }
}
