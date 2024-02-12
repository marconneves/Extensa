// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Request } from '../../src/Commands/Layer';
import { Message } from '../../src/Commands/Message';
import { Router } from '../../src/Commands/Router';
import createApp from '../../src/extensa';

const router = Router();

router.use('/ola/rota', function Rota(request: Request) {
  console.log('ROTA', request);
});

router.use('/internal/backups', function Rota(request: Request) {
  console.log('KKKKK', request);
});

const routerSub = Router();

routerSub.use('/listB', function Rota(request: Request) {
  console.log('VVVVVVVV', { request });
});
routerSub.use(
  '/list',
  function Mid(request, response, next) {
    request.trace = { crumbs: [] };
    console.log('MID', { request });
    next();
  },
  function Rota(request, response) {
    console.log('WWWWWWWW', { request });
    response.send({ ok: 'Valew Cara!' });
  }
);

router.use('/internal/backups', routerSub);

router.use('/internal/backups', routerSub);

const app = createApp();

app.use(router);

app.request(
  new Message({
    path: '/internal/backups/list',
    headers: {
      auth: ''
    },
    trace: {
      id: '1',
      crumbs: ['whatsapp#a', 'contentScript#a']
    }
  })
);

app.request(
  new Message({
    path: '/internal/backups/list',
    headers: {
      auth: ''
    },
    trace: {
      id: '1',
      crumbs: ['whatsapp#b', 'contentScript#a']
    }
  })
);
