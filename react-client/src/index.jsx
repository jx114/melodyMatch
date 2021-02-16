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
    this.handleInnerGenre = this.handleInnerGenre.bind(this);
    this.audioRef = React.createRef();
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
    this.setState({
      isLoading: false
    })
  }

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
        const newTracks = items.filter(item => item.track.popularity <= 50 && item.track.popularity >= 15 && item.track.preview_url)
        // console.log('this is filtered', newTracks);
        this.setState({
          genreTracks: newTracks
        });
        this.loadFirstSong();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  loadFirstSong() {
    const { genreTracks } = this.state;
    const { track } = genreTracks[0];
    this.setState({
      nowPlaying: {
        name: track.name,
        image: track.album.images[0].url,
        artists: track.artists,
        preview: track.preview_url
      }
    }, () => {
      console.log(this.audioRef);
      this.audioRef.current.pause();
      this.audioRef.current.load();
      this.audioRef.current.play();
    });
  }

  handleGenre(genre) {
    const { isSelected } = this.state;
    this.getCategoryPlaylists(genre);
    this.setState({
      selectGenre: genre,
      isSelected: !isSelected
    });
  }

  handleInnerGenre(genre) {
    this.getCategoryPlaylists(genre);
    this.setState({
      selectGenre: genre
    });
  }

  render () {
    const { nowPlaying, categories, isLoading, isSelected, loggedIn } = this.state;

    const { songLength, preview } = nowPlaying;
    console.log(preview);
    const renderAudio = preview
      ? (
        <div>
          <audio ref={this.audioRef} controls="controls">
            <source src={preview} type="audio/mpeg" />
          </audio>
        </div>
      )
      : (
        <div>Loading Audio...</div>
      )
    const renderSelect = isSelected
    ? (
      <div>
          <GenreForm categories={categories} handleGenre={this.handleInnerGenre}/>
          <div>Now Playing: {nowPlaying.name}</div>
          <div>
            <img src ={nowPlaying.image} style={{width: 300}}/>
          </div>
          <List artists={nowPlaying.artists}/>
          {renderAudio}
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

    return (
    <div>
      <h1>MelodyMatch</h1>
      {renderLoading}
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));