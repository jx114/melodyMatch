import React from 'react';

class GenreForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectGenre: '',
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { value} = e.target;
    this.setState({
      selectGenre: value
    })
    this.props.handleGenre(value);
  }

  render() {
    return (
      <div>
        <form>
          <label>
            Please Select A Genre:
            <select value={this.state.selectGenre} name={this.state.selectGenre} onChange={this.handleChange}>
              {this.props.categories.map((category) => <option value={category.id}>{category.name}</option>)}
            </select>
          </label>
        </form>
      </div>
    )
  }
}

export default GenreForm;
