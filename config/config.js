//config
module.exports = {
    development: {
        db: 'mongodb://localhost/jog_test',
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
            clientID: '1120024586',
            clientSecret: '5b9cee2d00af49317c22d2505530c298',
            callbackURL: 'http://www.lovejog.com/auth/weibo/callback'
        }
    },
    production: {
        db: 'mongodb://localhost/jog_test',
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


