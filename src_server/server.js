const express = require('express');
const multer = require('multer');
const multipart = multer();

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');

var fetch = require('node-fetch');
var sgMail = require('@sendgrid/mail');

const app = express();
const port = 8080;

const devServerEnabled = true;

if (devServerEnabled) {
  //reload=true:Enable auto reloading when changing JS files or content
  //timeout=1000:Time from disconnecting from server to reconnecting
  config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');

  //Add HMR plugin
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(config);

  //Enable "webpack-dev-middleware"
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }));

  //Enable "webpack-hot-middleware"
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static('./public'));

sgMail.setApiKey('your sendgrid api key');
const apikey = 'd932743022f5547f67376e077407421f';
//API
app.post('/sendemail', multipart.any(), async function (req, res) {

  console.log('req.body', req.body);

  let name = req.body.name;
  let location = req.body.location;

  let error = false;
  await asyncForEach(req.body.name, async (n, i) => {
    console.log(`asyncforeach account `);
    await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + location[i] + '&appid=' + apikey + '&units=metric', {
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then(async function (response) {
        // console.log(response);
        if (response.cod == 200) {
          let temp = response.main['temp'];
          let weather = response.weather[0]['main'];
          console.log(temp, '|', weather);
          const msg = {
              to: 'ToEmail@gmail.com',
              from: 'FromEmail@outlook.com',
              subject: 'Weather email',
              text: 'Hello!, ' + n +' Here is the in ' + location[i] + ' It is ' + temp + ' degress ' + weather + ' Thanks',
              html: '<strong>Hello ' + n + ' </strong><br/> <p> Here is the in ' + location[i] + '<br/> It is ' + temp + ' degress <br/>' + weather + '<br/><p>Thanks</p>'
          }
          console.log('msg', msg);
          await sgMail.send(msg).then(() => {
            console.log('ok');
          }).catch((error) => {
            console.log('error', error);
          });

          error = false;
        }
        else {
          error = true;
        }
      }).catch(function (error) {
        console.error(error);
      });
  });

console.log(error);
  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  if (!error) {
    res.end('success');
  } else {
    res.end('fail');
  }

});

app.listen(port, () => {
  console.log('Server started on port:' + port);
});