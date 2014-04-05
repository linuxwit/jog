var mail = require('../middlewares/mail');


mail.send(
    '新事件',
    message.Event,
    'support@lovejog.com',
    '376300248@qq.com'
);