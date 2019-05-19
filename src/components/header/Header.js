import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import UserProfile from "./UserProfile";
import Alerts from "./Alerts";
import "./header.css";
import "../../../node_modules/megadraft/dist/css/megadraft.css";
var _this;

class Header extends Component {

  constructor(props) {
    super(props);
    _this = this.props;
  }

  componentWillMount() {
    const { dispatch } = this.props;
    var path = this.props.history.location.pathname;
    if (path == '/') {
      //if logged in
      //this.props.history.replace("/dashboard");
    }
  }

  componentDidUpdate() {
    
  }

  logout() {
    localStorage.clear();
    _this.history.replace("/");
  }

  componentDidMount() {
    const { dispatch } = this.props;
  }
  
  onLogoutClick = event => {
    event.preventDefault();
    this.props.handleLogout();
    this.props.history.replace("/login");
  };

  
  toggleCal= event => {
    //dispatch action
    this.props.tgCal();
  };

  render() {
    var { home } = this.props;
    console.log(this.props.history);
    var pathname = this.props.history.location.pathname;
    var isLoginPage = pathname == '/';
    var isDashPage = pathname.indexOf("dashboard") > -1;
    var isUsersPage = pathname.indexOf("users") > -1;
    var isDocPage = pathname.indexOf("doc") > -1;
    
    if (this.props.projectId !== 'new') {
      isDocPage = true;
      isDashPage = false;
    }
    else {
      isDocPage = false;
      isDashPage = true;
    }
    


    if (isDocPage) {
      return (
        <nav className="navbar-expand-md navbar-light fixed-header">
          <Link to="/" className="navbar-brand">
            ZEBRA
          </Link>
        
          <div className="cal_btn" onClick={this.toggleCal}></div>
          <Link to="/" onClick={() => this.logout()}  className="user-area">
          </Link>
        </nav>
      );
    }
    else if (isDashPage) {
      return (
        <nav className="navbar-expand-md navbar-light fixed-header">
          <Link to="/" className="navbar-brand">
            ZEBRA
          </Link>
          <Link to="/" onClick={() => this.logout()} className="user-area">
          </Link>
        </nav>
      );
    }
    else {
      return (
        <nav className="navbar-expand-md navbar-light fixed-header">
          <Link to="/" className="navbar-brand">
            ZEBRA
          </Link>
        </nav>
      );
    }
  }
}

Header.propTypes = {
  //toggleCalendar: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { doc } = state;
  return {
    showCal: doc ? doc.showCal : false,
    projectId: doc.projectId
  };
};

export default connect(mapStateToProps)(withRouter(Header));
