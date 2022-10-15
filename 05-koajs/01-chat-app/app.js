const path = require('path');
const Koa = require('koa');
const app = new Koa();
const {subscribe, publish} = require('./subscriber');

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

router.get('/subscribe', async (ctx, next) => {
  const message = await new Promise((resolve) => {
    subscribe(resolve);
  });

  ctx.res.statusCode = 200;
  ctx.res.end(message);

  await next();
});

router.post('/publish', async (ctx, next) => {
  if (ctx.request.body.message) {
    publish(ctx.request.body.message);
  }

  ctx.res.statusCode = 200;
  ctx.res.end();

  await next();
});

app.use(router.routes());

module.exports = app;
