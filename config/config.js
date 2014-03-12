//config
module.exports = {
	development: {
		db: 'mongodb://lovejog:qwer4321@115.29.17.155/jog',
        //mongodb://user:pass@server.mongohq.com:port_name/db_name
		app: {
			name: 'love jog'
		}
	},
  	production: {
    	db: 'mongodb://localhost/jog',
		app: {
			name: 'love jog'
		}
 	}
}


