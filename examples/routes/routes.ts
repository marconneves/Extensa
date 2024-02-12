import { Request } from '../../src/Commands/Layer';
import Message from '../../src/Commands/Message';
import { Router } from '../../src/Commands/Router';

const router = Router();

router.use('/ola/rota', function Rota(request: Request) {
  console.log('ROTA', request);
});

router.use('/internal/backups', function Rota(request: Request) {
  console.log('KKKKK', request);
});

const routerSub = Router();

routerSub.use('/list', function Rota(request: Request) {
  console.log('BBBBB', request);
});

router.use('/internal/backups', routerSub);

router.start(
  new Message({
    path: '/internal/backups/list',
    headers: {
      auth: ''
    },
    trace: {
      id: '1',
      crumbs: ['whatsapp', 'contentScript', 'worker']
    }
  })
);
