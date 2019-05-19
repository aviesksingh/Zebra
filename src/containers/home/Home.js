import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import {DraftJS, MegadraftEditor, editorStateFromRaw, editorStateToJSON} from "megadraft";
import MainCalendar from "../../components/calendar/MainCalendar";
import Gantt from "../../components/gantt/Gantt";
import TeamList from "../../components/teamList/TeamList";
import { GoogleLogin } from 'react-google-login'; 
import { loginSuccess } from "../../actions/auth";

import "./home.css";
var _this;

class Home extends Component {
  constructor(props) {
    super(props);
    _this = this.props;

  }

  responseGoogle(response) {
    console.log(response);
    if (!response.onFailure || !response.error) {
      console.log("DONE");
      var email = response.profileObj.email;
      var name = response.profileObj.name;
      var firstName = response.profileObj.givenName;
      var lastName = response.profileObj.familyName;
      var imageUrl = encodeURIComponent(response.profileObj.imageUrl);
      var data = {};
      data['email'] = email;
      data['password'] = email+"_"+name;

      fetch("http://localhost:5000/auth/sign_up",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'email':email, 'password':email+"_"+name,'firstname':firstName,'lastname':lastName,'profilepic':imageUrl})
      }).then(function(res){ return res.json(); })
      .then(function(data){ 
          if (data.result.status == 'success') {
            var token = data.result.data;
            localStorage.setItem('token',token);
            localStorage.setItem('name',name);
            _this.dispatch(loginSuccess(token));
            _this.history.replace("/dashboard");
          }
       })
      
    }
    else {
      console.log("ERROR");
    }
  }

  componentDidUpdate() {
    if (localStorage.getItem('token')) {
      if (localStorage.getItem('token').length > 0) {
        this.props.history.replace("/dashboard");
      }
    }
  }

  componentDidMount() {
    //make API calls

  }

  componentWillMount() {
    if (localStorage.getItem('token')) {
      if (localStorage.getItem('token').length > 0) {
        _this.dispatch(loginSuccess(localStorage.getItem('token')));
        this.props.history.replace("/dashboard");
      }
    }
  }

  render() {
    var _this = this.props;
    const { showCal } = this.props;
    return (
      <div>
        <center>
          <img className="zebra-logo" src='./logo.png' width="100"/>
          <div className="zebra-hero">ZEBRA</div>
          <div className="zebra-desc">Manage all your projects from one place</div>
          <GoogleLogin
            scope={'email profile'}
            className="google-btn button is-medium is-dark is-rounded"
            clientId="102319615722-n8i1e26mf9v4kj22f41ip4uo861f2c2c.apps.googleusercontent.com"
            buttonText="Login with Google"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
          />
        </center>
      </div>
    );
  }
}

Home.propTypes = {
  showCal: PropTypes.bool,
  teamList: PropTypes.object,
  loggedIn: PropTypes.bool,
  loginSuccess: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  const { doc, auth } = state;
  return {
    showCal: doc ? doc.showCal : false,
    teamList: doc.teamList,
    loggedIn: auth.loggedIn
  };
};

export default connect(mapStateToProps)(Home);