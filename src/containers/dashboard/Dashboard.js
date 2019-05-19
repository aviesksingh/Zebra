import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import moment from 'moment';
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import Faye from 'faye';
import {DraftJS, MegadraftEditor, editorStateFromRaw, editorStateToJSON} from "megadraft";
import Grid from "react-bootstrap/lib/Grid"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import ProgressBar from "react-bootstrap/lib/ProgressBar"
import MainCalendar from "../../components/calendar/MainCalendar";
import Gantt from "../../components/gantt/Gantt";
import TeamList from "../../components/teamList/TeamList";
import { setupProject, setUpDashProjects, updateTasks } from "../../actions/home";


import "./dashboard.css";
var _this;
var client = new Faye.Client('http://52.15.83.136:3000/newton/');

class Dashboard extends Component {
  constructor(props) {
    super(props);
    _this = this.props;
  }

  componentDidMount() {
    //make dashboard  API calls
    fetch("http://localhost:5000/user_dashboard",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token')})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          //alert(JSON.stringify(data.result));
          if (data.result.status === 'success') {
            //alert(JSON.stringify(data.result.data));
            var projects = data.result.data.projects;
            //create a new list of projects and update the dashboard
            //alert(JSON.stringify(data.result.data.tasks));

            var newProjList = []
            for (var k in projects) {
              var newObj = {};
              newObj.title = projects[k].project_name;
              newObj.members = projects[k].members;
              newObj.project_id = projects[k].project_id;
              newObj.progress = projects[k].task_progress;
              newProjList.push(newObj);
            }
            _this.dispatch(setUpDashProjects(newProjList));

            var newTasks = [];
            var colors = ['#CD5C5C','#008B8B','#C71585','#FF4500','#2E8B57','#FFD700','#9370DB','#66CDAA','#663399','#6A5ACD','#483D8B','#0000CD','#32CD32','#4682B4','#00BFFF','#7B68EE','#A0522D','#696969'];
            for (var k in data.result.data.tasks) {
              var task =  data.result.data.tasks[k];
              var newObj2 = {};
              newObj2['title'] = task.task_name;
              newObj2['start'] = new Date(task.start_date);
              var d = moment(task.end_date,'M/D/YYYY');
              if(d == null || !d.isValid()) {
                newObj2['end'] = new Date();  
              }
              else {
                
                var month = (task.end_date).split('-')[0];
                var day = (task.end_date).split('-')[1];
                var year = (task.end_date).split('-')[2];
                newObj2['end'] = new Date(year, month, day);  
              }
                
              newObj2['all_day'] = true;
              newObj2['bgColor'] = colors[k];
              newTasks.push(newObj2);
            }
            

            _this.dispatch(updateTasks(newTasks));

            

          }
       })

      client.subscribe('/'+localStorage.getItem('token'), function(message) {
          //alert(message);
      });
  }

  openNewProject() {
    var r1 = Math.floor(Math.random() * 100); 
    var r2 = Math.floor(Math.random() * 1000); 
    var r3 = Math.floor(Math.random() * 100); 
    this.props.history.replace("/doc/new");
  }

  openProject(e) {
    console.log(e)
    this.props.history.replace("/doc/"+e);
  }

  componentWillMount() {
    _this.dispatch(setupProject('new'));
    if (localStorage.getItem('token')) {
      if(localStorage.getItem('token').length <= 0) {
        //_this.dispatch(loginSuccess(localStorage.getItem('token')));
        this.props.history.replace("/");
      }
    }
    else {
      this.props.history.replace("/");
    }
  }

  onChange = (editorState) =>  {
    this.setState({editorState});
  }

  onChange = (editorState) => {
    this.setState({editorState});
  }

  render() {
    const { showCal } = this.props;
    var cardStyle ={
      padding: '1%',
      maxWidth: 200
    }
    
    return (
      <div>
        <div className="cal_area_dash">
          <MainCalendar />
          
          <center>
            <div className="project_cards_area">
              <Row>
                <Col xs={12} md={4} onClick={() => this.openNewProject()}  className="project-card new-project-card col-md-4" style ={cardStyle}><h5>+ CREATE NEW PROJECT</h5></Col>
                {this.props.projects.map(project => <Col xs={12} md={4} key={project.project_id} id={project.project_id} key={project.project_id} onClick={(e) => this.openProject(project.project_id)} className="project-card col-md-4" style ={cardStyle} ><h5>{project.title}</h5><ProgressBar striped bsStyle="info" now={project.progress} /><p>{project.members} MEMBERS</p></Col>)}
              </Row>
            </div>
          </center>
        </div>
        
      </div>
    );
  }
}

Dashboard.propTypes = {
  showCal: PropTypes.bool,
  teamList: PropTypes.object,
  projects: PropTypes.array,
};

const mapStateToProps = state => {
  const { doc, users } = state;
  return {
    showCal: doc ? doc.showCal : false,
    teamList: doc.teamList,
    projects: doc.projects,
    taskList: doc.taskList
  };
};

export default connect(mapStateToProps)(Dashboard);