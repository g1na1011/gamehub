import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchUsers, findGames} from '../actions/index';
import _ from 'underscore';
import SearchedUsersList from '../containers/searched_users_list';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {searchTerm: ''};
    this.onInputChange = this.onInputChange.bind(this);
    this.onChangeSubmit = _.debounce(this.onChangeSubmit.bind(this), 200);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.hideSearch = this.hideSearch.bind(this);
  }

  onInputChange(event) {
    event.persist();
    this.setState({searchTerm: event.target.value}, this.onChangeSubmit(event));
    $('.UsersList').show();
  }

  onChangeSubmit(event) {
    this.props.fetchUsers({searchTerm: this.state.searchTerm});
    this.props.findGames({searchTerm: this.state.searchTerm});
  }

  onFormSubmit(event) {
    event.preventDefault();
    this.props.fetchUsers({searchTerm: this.state.searchTerm});
    this.props.findGames({searchTerm: this.state.searchTerm});
  }

  hideSearch() {
    $('.UsersList').hide();
    document.getElementById("searchInput").reset();
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit} id="searchInput" className="col-lg-8 col-md-8 col-sm-8 col-xs-8 navbar-form" role="search">
        <div className="form-group">
          <input className="form-control"
            type="text"
            placeholder="search for a friend or a game"
            value={this.state.searchTerm}
            onChange={this.onInputChange}/>
          <div className ="UsersList" onClick = {this.hideSearch}>
            <SearchedUsersList />
          </div>
        </div>
      </form>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchUsers: fetchUsers,
    findGames: findGames
  }, dispatch);
}

export default connect(null, mapDispatchToProps)(SearchBar);
