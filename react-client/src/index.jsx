import React from 'react';
import ReactDOM from 'react-dom';
import Spotify from 'spotify-web-api-js';
import List from './components/List.jsx';

const spotifyWebApi = new Spotify();

class App extends React.Component {
  constructor(props) {
    super(props);

    const params = this.getHashParams();

    this.state = {
      loggedIn: params.access_token ? true : false,
      nowPlaying: {
        name: 'Not Checked',
        image: '',
        isPlaying: false,
        artists: [],
        songLength: '',
        similarArtists: [],
        similarSongs: []
      }
    }
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  componentDidMount() {
    const { nowPlaying } = this.state;
    const { isPlaying } = nowPlaying;
    isPlaying ? null : this.getNowPlaying();
  }

  getNowPlaying() {
    spotifyWebApi.getMyCurrentPlaybackState()
      .then((response) => {
        console.log(response)
        this.getRelatedArtists(response.item.artists[0].id);
        this.setState({
          nowPlaying: {
            name: response.item.name,
            image: response.item.album.images[0].url,
            isPlaying: response.is_playing,
            artists: response.item.artists,
            songLength: response.item.duration_ms
          }
        })
      })
      .catch((err) => {
        console.log(err);
      });
  }
  getRelatedArtists(artistId) {
    spotifyWebApi.getArtistRelatedArtists(artistId)
      .then((response) => {
        console.log(response);
        this.setState({
          similarArtists: response.artists
        });
        this.getArtistTopTracks(response.artists[0].id)
      })
      .catch((err) => {
        console.log(err);
      })
  }

  getArtistTopTracks(artistId) {
    spotifyWebApi.getArtistTopTracks(artistId, 'US')
      .then((response) => {
        console.log(response);
        this.setState({
          similarSongs: response.tracks
        });
      })
      .catch((err) => {
        console.log(err);
      })
  }

  render () {
    const { nowPlaying } = this.state;
    const { songLength } = nowPlaying;
    console.log(songLength);
    setTimeout(() => this.getNowPlaying(), songLength);
    return (
    <div>
      <h1>MelodyMatch</h1>
      <a href='http://localhost:8888'>
        <button>Log in with Spotify</button>
      </a>
      <div>Now Playing: { this.state.nowPlaying.name }</div>
      <div>
        <img src ={this.state.nowPlaying.image} style={{width: 100}}/>
      </div>
      <List artists={this.state.nowPlaying.artists}/>
      <button onClick={() => this.getNowPlaying()}>
        Check Now Playing
      </button>
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));