"use strict";
const Promise = require( "bluebird" );
const sqlConnector = require( "./sqlConnector" );

const connector = new sqlConnector(
    {
        host    : 'localhost',
        user    : 'usr',
        password    : 'pass',
        database    : 'secretStuff',
        port    : 8889
    });

class secureToken
{
    constructor()
    {
        this.url = this._randomString();
    };

    _queryHelper( query, fields )
    {
        return new Promise( ( resolve, reject ) => {
            connector.query( query, fields, ( error, results ) => {
                if( error )
                {
                    connector.rollback( () => {
                        reject( error );
                    } );
                }
                else
                {
                    resolve( results );
                }
            });
        });
    };

    _randomString()
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
    }

    static fetch( urlIn )
    {
        connector.connect();
        let row;
        return this._queryHelper( 'SELECT * FROM secretTable WHERE `generatedURL` = ?', urlIn )
        .then( ( passedResults ) => {
            if( passedResults )
            {
                row = JSON.parse( passedResults[0] );
            }
            else
            {
                row.data = "failed";
            }
            return row;
        })
        .then( this.queryHelper( 'DELETE FROM secretTable WHERE `generatedURL` = ?', urlIn ) )
        .then( () => {
            if( (getTime() - row.time ) < 86400 )
            {
                // valid 24 hour period
                return row.data;
            }
            else
            {
                // invalid, expired
                row.data = "failed";
                return row.data;
            }
        })
        .catch( ( error ) => {
            return "error";
        });
    };

    storeObjectData( secretDataIn )
    {
        connector.connect();

        return new Promise( (resolve, reject ) => {
            connector.beginTransaction( ( error ) => {
                if( error ) return reject( error );
                resolve();
            });
        })
        .then(() => {
            return this._queryHelper( 'INSERT INTO secretTable ( url, time, data ) VALUES ( ?, ? ,? )', [ this.url, getTime(), secretDataIn ] );
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                connector.commit(( error ) => {
                    if( error )
                    {
                        connector.rollback(() =>
                        {
                            reject();
                        });
                    }
                    else
                    {
                        resolve();
                    }
                });
            });
        })
        .then(() => {
            connector.end();
        });
    };

    // _setURL()
    // {
    //     do
    //     {
    //         let tmpString = this._randomString();
    //     }
    //     while( _checkURL( tmpString ) )
    //
    //     this.url = tmpString;
    // };

    // _checkURL( stringIn )
    // {
    //     connector.connect();
    //
    //     this._queryHelper( 'SELECT * FROM secretTable WHERE `generatedURL` = ?', stringIn )
    //     .then( ( results ) => {
    //             if( !results || results.length === 0 )
    //             {
    //                 connector.end();
    //                 return false;
    //             }
    //             else
    //             {
    //                 connector.end();
    //                 return true;
    //             }
    //     });
    // };


    // storeObjectData( urlIn, timeIn, secretDataIn )
    // {
    //     connector.connect();
    //
    //     return new Promise( (resolve, reject ) => {
    //         connector.beginTransaction( ( error ) => {
    //             if( error ) return reject( error );
    //             resolve();
    //         });
    //     })
    //
    //     .then(() => {
    //         return this._queryHelper( 'INSERT INTO secretTable ( url, time, data ) VALUES ( ?, ? ,? )', [ urlIn, timeIn, secretDataIn ] );
    //     })
    //
    //     .then(() => {
    //         return new Promise((resolve, reject) => {
    //             connector.commit(( error ) => {
    //                 if( error ) {
    //                     connector.rollback(() => {
    //                         reject();
    //                     });
    //                 } else {
    //                     resolve();
    //                 }
    //             });
    //         });
    //     })
    //
    //     .then(() => {
    //         connector.end();
    //     });
    // };

    // static fetch( urlIn )
    // {
        // connector.connect();
        // connection.query( 'SELECT * FROM secretTable WHERE `generatedURL` = ?', urlIn, function( error, results, fields)
        // {
        //     if( error )
        //     {
        //         throw error;
        //     }
        //     if( results.length === 0 )
        //     {
        //         connector.end();
        //         return false;
        //     }
        //     var row = JSON.parse( results[0] );
        // });
        //
        // // protection from multiple views ( delete on first query )
        // connection.query( 'DELETE FROM secretTable WHERE `generatedURL` = ?', urlIn, function( error )
        // {
        //     if( error )
        //     {
        //         throw error;
        //     }
        // });
        //
        // if( ( getTime() - row.time ) < 86400000 )
        // {
        //     // valid 24 hour period
        //     return row.data;
        // }
        // else
        // {
        //     // invalid, can't have
        //     return false;
        // }
    // }
}

module.exports = secureToken;