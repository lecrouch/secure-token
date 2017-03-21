"use strict";
const Promise = require( "bluebird" );
const sqlConnector = require( "./sqlConnector" );

var connector = new sqlConnector(
    {
        host    : 'localhost',
        user    : 'root',
        password    : 'root',
        database    : 'secretStuff',
        port    : 8889
    });

class secureToken
{
    constructor( stringIn )
    {
        do
        {
            this.url = randoString();
        }
        while( checkURL( this.url ) )

        storeObjectData( this.url, getTime(), stringIn );
    };

    setToken( stringIn )
    {
        this.secretData = stringIn;
    };

    //  --- member functions ---
    randoString()
    {
        const validChars = "abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let outputString = '';
        for( let i = 0; i < 32  ; i++ )
        {
            outputString += validChars[ Math.floor( Math.random() * validChars.length ) ];
        }
        return outputString;
    };

    getURL()
    {
        return this.url;
    };

    checkURL( stringIn )
    {
        connector.connect();
        connector.query( 'SELECT * FROM secretTable WHERE `generatedURL` = ' + stringIn, function( error, results, fields )
        {
            if( error )
            {
                throw error;
            }
            if( results.length === 0 )
            {
                connector.end();
                return false;
            }
            else
            {
                connector.end();
                return true;
            }
        });
    };

    static fetch( urlIn )
    {
        connector.connect();
        connection.query( 'SELECT * FROM secretTable WHERE `generatedURL` = ?', urlIn, function( error, results, fields)
        {
           if( error )
           {
               throw error;
           }
           if( results.length === 0 )
           {
               connector.end();
               return false;
           }
           var row = JSON.parse( results[0] );
        });

        // protection from multiple views ( delete on first query )
        connection.query( 'DELETE FROM secretTable WHERE `generatedURL` = ?', urlIn, function( error )
        {
            if( error )
            {
                throw error;
            }
        });

        if( ( getTime() - row.time ) < 86400000 )
        {
            // valid 24 hour period
            return row.data;
        }
        else
        {
            // invalid, can't have
            return false;
        }
    };

    storeObjectData( urlIn, timeIn, secretDataIn )
    {
        connector.connect();
        connector.beginTransaction( function( error )
        {
            if( error )
            {
                throw error;
            }
            connector.query( 'INSERT INTO secretTable SET url = ?', urlIn, function( error )
            {
                if( error )
                {
                    connector.rollback( function()
                    {
                       throw error;
                    });
                }
            });
            connector.query( 'INSERT INTO secretTable SET time = ?', timeIn, function( error )
            {
                if( error )
                {
                    connector.rollback( function()
                    {
                        throw error;
                    });
                }
            });
            connector.query( 'INSERT INTO secretTable SET data = ?', secretDataIn, function( error )
            {
                if( error )
                {
                    connector.rollback( function()
                    {
                       throw error;
                    });
                }
            });
            connector.commit( function( error ) )
            {
                if( error )
                {
                    connector.rollback( function()
                    {
                        throw error;
                    });
                }
            }
        });
        connector.end();
    };
}

module.exports = secureToken;