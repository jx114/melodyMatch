import React from 'react';
import ReactDOM from 'react-dom';
import Spotify from 'spotify-web-api-js';
import List from './components/List.jsx';
import GenreForm from './components/GenreForm.jsx';

const spotifyWebApi = new Spotify();

class App extends React.Component {
  constructor(props) {
    super(props);

    const params = this.getHashParams();

    this.state = {
      loggedIn: params.access_token ? true : false,
      nowPlaying: {
        name: 'Nothing is playing right now',
        image: '',
        isPlaying: false,
        artists: [],
        songLength: '',
        preview: ""
      },
      similarArtists: [],
      similarSongs: [],
      categories: [],
      isLoading: true,
      selectGenre: '',
      isSelected: false,
      genreTracks: [],
    }
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
    this.handleGenre = this.handleGenre.bind(this);
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
    const { nowPlaying, isLoading } = this.state;
    const { isPlaying } = nowPlaying;
    this.getCategories();
    // isPlaying ? null : this.getNowPlaying();
    this.setState({
      isLoading: !isLoading
    })
  }

  // getNowPlaying() {
  //   spotifyWebApi.getMyCurrentPlaybackState()
  //     .then((response) => {
  //       console.log(response)
  //       // console.log(response);
  //       // console.log(response.item.uri.slice(14));
  //       this.getRelatedArtists(response.item.artists[0].id);
  //       this.setState({
  //         nowPlaying: {
  //           name: response.item.name,
  //           image: response.item.album.images[0].url,
  //           isPlaying: response.is_playing,
  //           artists: response.item.artists,
  //           songLength: response.item.duration_ms,
  //           preview: response.item.preview_url
  //         }
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  getRelatedArtists(artistId) {
    spotifyWebApi.getArtistRelatedArtists(artistId)
      .then((response) => {
        // console.log(response);
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
        // console.log(response);
        this.setState({
          similarSongs: response.tracks
        });
      })
      .catch((err) => {
        console.log(err);
      })
  }


  getCategories() {
    spotifyWebApi.getCategories()
      .then((response) => {
        // console.log(response);
        this.setState({
          categories: response.categories.items
        })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getCategoryPlaylists(genre) {
    const randomList = Math.floor(Math.random() * 20);
    spotifyWebApi.getCategoryPlaylists(genre)
      .then(({playlists}) => {
        // console.log(playlists.items[randomList].id);
        this.getPlaylistTrack(playlists.items[randomList].id);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getPlaylistTrack(playlistId) {
    spotifyWebApi.getPlaylistTracks(playlistId)
      .then(({items}) => {
        const newTracks = items.filter(item => item.track.popularity <= 50 && item.track.popularity >= 15)
        // console.log('this is filtered', newTracks);
        this.setState({
          genreTracks: newTracks
        });
      })
      .then(this.loadFirstSong())
      .catch((err) => {
        console.log(err);
      });
  }

  loadFirstSong() {
    const { genreTracks } = this.state;
    const randomTrack = Math.floor(Math.random() * genreTracks.length);
    console.log('this is genreTracks', this.state.genreTracks);
    this.setState({
      nowPlaying: {
        name: genreTracks[randomTrack].name,
      }
    })
  }

  handleGenre(genre) {
    const { isSelected } = this.state;
    this.getCategoryPlaylists(genre);
    this.setState({
      selectGenre: genre,
      isSelected: !isSelected
    });
  }

  render () {
    const { nowPlaying, categories, isLoading, isSelected, loggedIn } = this.state;

    const { songLength, preview } = nowPlaying;
    const renderSelect = isSelected
    ? (
      <div>
          <div>Now Playing: {nowPlaying.name}</div>
          <div>
            <img src ={nowPlaying.image} style={{width: 100}}/>
          </div>
          <List artists={nowPlaying.artists}/>
          <audio controls="controls">
            <source src={preview} type="audio/mpeg" />
          </audio>
          {/* <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button> */}
        </div>
        )
        : (<div>
          <GenreForm categories={categories} handleGenre={this.handleGenre}/>
        </div>);
    const renderLogin = loggedIn
      ? (
        <div>
          {renderSelect}
        </div>
      )
      : (
        <div>
          <a href='http://localhost:8888'>
            <button>Log in with Spotify</button>
          </a>
        </div>
      );
    const renderLoading = isLoading
      ? (<div>Loading...</div>)
      : (
        <div>
          {renderLogin}
        </div>
      );

    // setTimeout(() => this.getNowPlaying(), 30000);
    return (
    <div>
      <h1>MelodyMatch</h1>
      {renderLoading}
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));