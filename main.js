const database = require('./databasepg');
const express = require('express');
const app = express();
const http = require('http');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIAR2ESSFTRLLHZWS2G',
  secretAccessKey: '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',
  region: 'eu-north-1'
});

function sendEmail(receiver, about, message){
  const params = {
    Source: 'vladnohai@gmail.com',
    Destination: {
      ToAddresses: [receiver]
    },
    Message: {
      Subject: {
        Data: about
      },
      Body: {
        Text: {
          Data: message
        }
      }
    },
    ConfigurationSetName: 'MyConfigurationSet'
  };

  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  sendPromise.then(
    function(data) {
      console.log(data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
  });
}

// enable CORS
app.use((req, res, next) => {
  console.log(req.url);
  console.log(req.method);
  //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  next();
});

// handle requests
app.get('/search', (req, res) => {
  const searchTerm = req.query.term;
  const encodedSearchTerm = encodeURIComponent(searchTerm);

  const options = {
    hostname: '3.124.194.175',
    port: 3000,
    path: '/igdb?term=' + encodedSearchTerm,
    method: 'GET'
  };

  const httpReq = http.request(options, (httpRes) => {
    let data = '';

    httpRes.on('data', (chunk) => {
      data += chunk;
    });

    httpRes.on('end', () => {
      res.end(data);
    });
  });

  httpReq.on('error', (error) => {
    console.error(error);
  });

  httpReq.end();
});

app.get('/cracked', (req, res) => {
  const gameTitle = req.query.term;
  const encodedGameTitle = encodeURIComponent(gameTitle);

  const options = {
    hostname: '3.124.194.175',
    port: 3000,
    path: '/filelist?term=' + encodedGameTitle,
    method: 'GET'
  };

  const httpReq = http.request(options, (httpRes) => {
    let data = '';

    httpRes.on('data', (chunk) => {
      data += chunk;
    });

    httpRes.on('end', () => {
      res.end(data);
    });
  });

  httpReq.on('error', (error) => {
    console.error(error);
  });

  httpReq.end();
});

app.post('/addnotification', (req, res) => {
  const email = req.query.mail;
  const title = req.query.title;
  database.query('select * from emails_games where emails = $1 and games = $2', [email, title]).then(rez =>{
    if(rez.rows.length == 0){
      const sql = 'insert into emails_games (emails, games) values ($1, $2)';
      const values = [email, title];
      database.query(sql, values);
    }
  })
  res.end('palceholder');
});

function routineCheck(){
  database.query('select distinct games from emails_games').then(allGames => {
    for(let game of allGames.rows){
      console.log(game);
      const encodedGameTitle = encodeURIComponent(game.games);
      const options = {
        hostname: '3.124.194.175',
        port: 3000,
        path: '/filelist?term=' + encodedGameTitle,
        method: 'GET'
      };
    
      const httpReq = http.request(options, (httpRes) => {
        let data = '';
    
        httpRes.on('data', (chunk) => {
          data += chunk;
        });
    
        httpRes.on('end', () => {
          if(data == 'null'){
            console.log('still nothing');
          }
          else{
            data = JSON.parse(data);
            console.log('sending emails about ' + game.games);
            /*
            database.query('select emails from emails_games where games = $1', [game.games]).then(rez => {
              for(let result of rez.rows){
                sendEmail(result.emails, 
                          "ALERT: GAME " + game.games + " WAS CRACKED!!!",
                          "ACCESS " + game.games + " 100% LEGAL ON LINK " + data.torrentLink + '!!!'
                        );
              }
            })       
            database.query('delete from emails_games where games = $1', [game.games]);
            */
          }
        });
      });

      httpReq.on('error', (error) => {
        console.error(error);
      });

      httpReq.end();
    }
  });
}

// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

routineCheck();

