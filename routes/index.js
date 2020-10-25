var express = require('express');
var router = express.Router();

/* Spotify API utility code */
var SpotifyWebApi = require('spotify-web-api-node');
const REFRESH_INTERVAL = 360000;

spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

function getSpotifyBearerToken() {
  spotifyApi.clientCredentialsGrant()
    .then(res => {
      console.log('New access token generated: ' + res.body['access_token']);
      spotifyApi.setAccessToken(res.body['access_token']);
    }, err => {
      console.log(err);
    });
}

getSpotifyBearerToken(); // initial call when index router is loaded
var tokenRefreshInterval = setInterval(getSpotifyBearerToken, REFRESH_INTERVAL);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Collagify - Spotify album collage generator' });
});

/* POST albums list */
router.post('/', function(req, res, next) {
  var albumIdStr = req.body.albumIdStr;
  var tidiedAlbumIdStr = albumIdStr.replace(/\s+|\r?\n|\r/gm, ''); // remove spaces, newlines, CRs
  albumArr = tidiedAlbumIdStr.split(',');

  spotifyApi.getAlbums(albumArr)
    .then(response => {
      var albums = response.body.albums;
      res.send(albums);
    }, error => {
      console.log(error);
      next(error);
    });
});

module.exports = router;
