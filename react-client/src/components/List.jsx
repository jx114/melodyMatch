import React from 'react';
import ReactDOM from 'react-dom';

const List = ({artists}) => {
  const artistNames = [];
  artists.map((artist) => artistNames.push(artist.name))
  return (
    <div>Artists: {artistNames.join(', ')}</div>
  );
}

export default List;