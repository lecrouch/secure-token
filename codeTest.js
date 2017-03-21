"use strict";

const express = require( "express" );
const app = express();

const secureToken = require( "./secureToken" );


app.post( "/secrets", function( req, res )
{
    let newToken = new secureToken( "secret data" );
    res.send( "localhost:3000/secrets/" + newToken.getURL() );
});

app.get( "/secrets/:token", function( req, res )
{
    let token = req.params.token;
    // wanted to run a 'fetch( token )' but just realized that I boned that hard...
    let data = secureToken.fetch( token );
    if( data !== false )
    {
        app.send( data );
    }
    else
    {
        app.send( "shit's expired or not found" );
    }
});

var server = app.listen( 3000, function()
{
    var host = server.address().address
    var port = server.address().port

    console.log( "hella secure" );
});



