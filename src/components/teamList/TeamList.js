/*global gantt*/
import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import "./teamList.css";
import { toggleInviteModal, setProjectName } from "../../actions/home";

var _this;

class TeamList extends Component {
  constructor(props) {
    super(props);
    _this = this.props;
    this.state = { visible: false, projectName: '' };
    
  }

  inviteShow() {
    _this.dispatch(toggleInviteModal());
  }
  
  addTask(id) {
    alert(id);
  }

  componentDidMount() {
    
  }

  updateProjectName(e) {
    this.props.dispatch(setProjectName(e.target.value));
    if ((e.target.value).trim().length > 0) {
      var newName = (e.target.value).trim();
      fetch("http://localhost:5000/update_project",
        {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({'token':localStorage.getItem('token'), 'project_id':this.props.projectId,'name':newName})
        }).then(function(res){ return res.json(); })
        .then(function(data) { 
            
         })
    }
  }
  
  render() {
    var userList = this.props.teamList;

    if (userList != null && userList.length > 0) {
      return (
        <div>
         <input className=" projectNameBox" type="text" value={this.props.projectName} onChange={(evt) => this.updateProjectName(evt)}/>
        <div className="team-container">
        
            {userList.map(mems =>
            <span key={mems.id} onClick={(e) => this.addTask(mems.id)} className="team-members" style={{background:mems.color}}>{mems.name}</span>
          )}
          <button onClick={() => this.inviteShow()} className="button is-small is-link is-outlined is-rounded" >ADD PEOPLE</button>
        </div>
        </div>
      );
    }
    else {
      return (
        <div className="team-container">
            <span style={{marginRight:10}}>Not Shared With Others</span>
            <button onClick={() => this.inviteShow()}  className="button is-small is-link is-outlined is-rounded" >ADD PEOPLE</button>
        </div>
      );
    }
    
  }
}
TeamList.propTypes = {
   
    dispatch: PropTypes.func.isRequired
  };
  
  const mapStateToProps = state => {
    const { doc } = state;
    return {
      showCal: doc ? doc.showCal : false,
      teamList: doc.teamList,
      projectId: doc.projectId,
    };
  };
  
  export default connect(mapStateToProps)(TeamList);
