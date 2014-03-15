//config
module.exports = {
    development: {
        db: 'mongodb://localhost/jog',
        //mongodb://user:pass@server.mongohq.com:port_name/db_name
        app: {
            name: 'love jog'
        },
        qiniu: 'http://lovejog.qiniudn.com',
        qq: {
            clientID: '101038143',
            clientSecret: 'fd8a92e3619747ff712a231bf1d0aa0d',
            callbackURL: 'http://www.lovejog.com/auth/qq/callback'
        },
        sina: {
            clientID: 'q',
            clientSecret: 'q',
            callbackURL: 'q'
        }
    },
    production: {
        db: 'mongodb://localhost/jog',
        app: {
            name: 'love jog'
        },
        qiniu: 'http://lovejog.qiniudn.com',
        qq: {
            clientID: '',
            clientSecret: '',
            callbackURL: ''
        },
        sina: {
            clientID: '',
            clientSecret: '',
            callbackURL: ''
        }
    }
}


