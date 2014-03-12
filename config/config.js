//config
module.exports = {
	development: {
		db: 'mongodb://localhost/jog',
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


