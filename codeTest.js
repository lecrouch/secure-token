"use strict";

const express = require( "express" );
const app = express();

const secureToken = require( "./secureToken" );


app.post( "/secrets", function( req, res )
{
    let newToken = new secureToken();
    newToken.storeObjectData( "secret data" )
    .then( () => {
        res.send( "localhost:3000/secrets/" + newToken.getURL() );
    })
    .catch( ( error ) => {
        res.status( 500 );
        res.send( error.message );
    });
});

app.get( "/secrets/:token", function( req, res )
{
    let token = req.params.token;
    let data = secureToken.fetch( token );
    if( data === "failed" )
    {
        res.send( "expired or not found" );
    }
    else if( data === "error" )
    {
        res.status( 500 );
        res.send( "something real bad happened" );
    }
    else
    {
        res.send( data );
    }
});

var server = app.listen( 3000, function()
{
    var host = server.address().address
    var port = server.address().port

    console.log( "hella secure" );
});



