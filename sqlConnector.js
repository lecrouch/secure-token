"use strict";

const mysql = require( "mysql" );

class sqlConnector
{
	constructor( optionsIn )
	{
		this.connection = mysql.createConnection( optionsIn );
	}

	connect()
	{
		this.connection.connect();
	}

	beginTransaction( options, callback )
	{
		this.connection.begintransaction( options, callback );
	}

	commit( options, callback )
	{
		this.connection.commit( options, callback );
	}

	rollback( options, callback )
	{
		this.connection.rollback( options, callback );
	}

	end()
	{
		this.connection.end();
	}

	query( queryIn, callbackIn )
	{
		this.connection.query( queryIn, callbackIn );
	}
}

module.exports = sqlConnector;
