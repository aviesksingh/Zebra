import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import Board from 'react-trello'
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import Rodal from 'rodal';
import Faye from 'faye';
import CheckboxTree from 'react-checkbox-tree';
import {DraftJS, MegadraftEditor, editorStateFromRaw, editorStateToJSON} from "megadraft";
import MainCalendar from "../../components/calendar/MainCalendar";
import Gantt from "../../components/gantt/Gantt";
import TeamList from "../../components/teamList/TeamList";
import Kanban from "../../components/kanban/Kanban";
import Loader from "../../components/loader/Loader";
import { setupProject, saveContent, changeDocData, changeKanbanData, fetchTeamList, toggleInviteModal, updateChat, clearKanBan, setProjectName } from "../../actions/home";
import 'rodal/lib/rodal.css';
import "./doc.css";

var _this, _t;
var client = new Faye.Client('http://52.15.83.136:3000/newton/');
var inviteEmail = "";
var chatMessage = "";
var emptyKanban = {
  lanes: [
      {
      id: '1',
      title: 'Planned Tasks',
      cards: [
      ]
      },
      {
      id: '2',
      title: 'In Progress',
      cards: []
      },
      {
      id: '3',
      title: 'Completed',
      cards: []
      }
  ]
  };

class Doc extends Component {
  constructor(props) {
    super(props);
    const myContent = {
      "entityMap": {},
      "blocks": [
        {
          "key": "ag6qs",
          "text": "",
          "type": "unstyled",
          "depth": 0,
          "inlineStyleRanges": [],
          "entityRanges": [],
          "data": {}
        }
      ]
    };
    const editorState = editorStateFromRaw(myContent);
    this.state = {editorState, inviteValue: '', chatMessage: ''};

    _this = this.props;
    _t = this;
  }

  updateInputValue(e) {
    this.setState({
      inviteValue: e.target.value
    });
  }

  updateChatMessage(e) {
    this.setState({
      chatMessage: e.target.value
    });

    if (e.key === 'Enter') {
      if ((e.target.value).length > 0) {
        client.publish('/'+this.props.projectId, {text: e.target.value,type: 'chat', from: localStorage.getItem('name','random'),token: localStorage.getItem('token','')});
      }
      e.target.value = '';
      this.setState({
        chatMessage: ''
      });
    }
    
    
  }

  inviteUser() {
    // make api call and hide the invite modal
    //alert(_t.state.inviteValue);
    
    fetch("http://localhost:5000/invite",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'),'project_id':this.props.projectId,'email_id':_t.state.inviteValue})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          
          if (data.result.status === 'success') {
            _this.dispatch(toggleInviteModal());
            _t.remakeProject();
          }
          else {
            _this.dispatch(toggleInviteModal());
          }
       })

      
  }

  inviteHide() {
    _this.dispatch(toggleInviteModal());
  }

  scrollToBottom () {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentWillMount() {
    if (localStorage.getItem('token')) {
      if(localStorage.getItem('token').length <= 0) {
        //_this.dispatch(loginSuccess(localStorage.getItem('token')));
        _this.history.replace("/");
      }
    }
    else {
      _this.history.replace("/");
    }
  }

  remakeProject() {
    var pathname = _this.history.location.pathname;
    var urlParts = pathname.split("/");
    var pid = urlParts[urlParts.length - 1];
    fetch("http://localhost:5000/fetch_doc",
        {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({'token':localStorage.getItem('token'), 'project_id':pid})
        }).then(function(res){ return res.json(); })
        .then(function(data) { 
            _this.dispatch(clearKanBan());
            if (data.result.status === 'success') {
              var docData = data.result.data.project_details.doc_content;
              if(docData === "") {
                docData = {
                  entityMap: {},
                  blocks: [
                    {
                      key: "ag6qs",
                      text: "",
                      type: "unstyled",
                      depth: 0,
                      inlineStyleRanges: [],
                      entityRanges: [],
                      data: {}
                    }
                  ]
                };
                var editorState = editorStateFromRaw(docData);
                _t.setState({editorState});
              }
              else {
                var editorState = editorStateFromRaw(JSON.parse(docData));
                _t.setState({editorState});
              }
              //setup members
              var mems = data.result.data.project_details.members;
              _this.dispatch(fetchTeamList(mems)); 

              var projectName = data.result.data.project_details.project_name;
              _this.dispatch(setProjectName(projectName));
             
              //_t.state = {editorState};
              //_t.state.editorState = editorStateFromRaw(docData);
            }
         })
  }

  componentDidMount() {
    //make API calls
    var pathname = _this.history.location.pathname;
    var isNew = pathname.indexOf("new") > -1
    if (isNew) {
      //make API call to setup project and change
      fetch("http://localhost:5000/new_project",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'), 'project_name':'new','doc_content':''})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          if (data.result.status === 'success') {
            //set up project
            _this.dispatch(setupProject(data.result.data));
            _this.dispatch(clearKanBan());
            _this.history.replace("/doc/"+data.result.data);
            _t.remakeProject();
          }
       })
    }
    else {
      //get project id from url
      var pathname = _this.history.location.pathname;
      var urlParts = pathname.split("/");
      var pid = urlParts[urlParts.length - 1];
      
      //fetch content from API and setup 
      _this.dispatch(setupProject(pid));
      _this.dispatch(clearKanBan());
      fetch("http://localhost:5000/fetch_doc",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'), 'project_id':pid})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          
          if (data.result.status === 'success') {
            var docData = data.result.data.project_details.doc_content;
            if(docData === "") {
              docData = {
                entityMap: {},
                blocks: [
                  {
                    key: "ag6qs",
                    text: "",
                    type: "unstyled",
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {}
                  }
                ]
              };
              var editorState = editorStateFromRaw(docData);
              _t.setState({editorState});
            }
            else {
              var editorState = editorStateFromRaw(JSON.parse(docData));
              _t.setState({editorState});
            }
            //setup members
            var mems = data.result.data.project_details.members;
            
            _this.dispatch(fetchTeamList(mems));

            var projectName = data.result.data.project_details.project_name;
            _this.dispatch(setProjectName(projectName));
            //_t.state = {editorState};
            //_t.state.editorState = editorStateFromRaw(docData);

            //set Kanban
            //alert(JSON.stringify(data.result.data.tasks));
           
          }
       })
    }
    
    client.unsubscribe('/'+pid);
    // subscribe to project 
    client.subscribe('/'+pid, function(message) {
      //alert(JSON.stringify(message));
      if (message.type === 'update' && message.token !== localStorage.getItem('token')) {
        _t.remakeProject();
      }
      if (message.type === 'update_kanban' && message.token !== localStorage.getItem('token')) {
        _this.dispatch(changeKanbanData(emptyKanban));
      }
      if (message.type === 'chat' ) {
        //alert(message.text);
        _this.dispatch(updateChat(message));
        _t.scrollToBottom();
      }
    });
    
  }

  onChange = (editorState) => {
    this.setState({editorState});
    const content = editorStateToJSON(editorState);
    console.log(this.props.projectId);
    // Your function to save the content
    
    fetch("http://localhost:5000/save_project",
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'), 'project_id':this.props.projectId,'doc_content':content})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          console.log("SAVED CONTENT");
          console.log(data);
       })
    console.log(content);
    client.publish('/'+this.props.projectId, {text: '',type: 'update', from: localStorage.getItem('name','random'),token: localStorage.getItem('token','')});
    
  }

  

  render() {
    const { showCal } = this.props;
    var tdata = this.props.teamList; 
    var calDom = <div></div>;

    if (this.props.showCal == true) {
      var calDom = <div className="cal_area cal_sidebar"><MainCalendar/></div>;
    }
    else {
      <div></div>;
    }
    
    if (this.props.projectId === "new") {
      return (
        <div>
          {calDom}
          <TeamList projectName={this.props.projectName} teamList={tdata}/>
          <div className="editor">
            <Loader/>
          </div>
        </div>
      );
    }
    else {
      return (
        <div>
          {calDom}
          <TeamList projectName={this.props.projectName} teamList={tdata}/>
          <Kanban />
          <div className="editor">
            <MegadraftEditor className="font"
            placeholder ={"Start editing..."}
            editorState={this.state.editorState}
            onChange={this.onChange}/>
          </div>
          <div className="chatArea">
            <div className="messageList">
            {this.props.chatMessages.map(msg => <div className="msgBody"><span className="msgName">{msg.from}</span>{msg.text}</div>)}
            <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}></div>
            </div>
          <div className="chatTextArea">
                <input className="chatInput" type="text"  onKeyPress={(evt) => this.updateChatMessage(evt)} placeholder="Enter a message"/>
                
              </div>
          </div>
          <Rodal style={{zIndex:4000}} visible={this.props.inviteVisible} onClose={this.inviteHide.bind(this)}>
            <center>
              <div style={{margin:10, marginTop:40,marginBottom:20,zIndex:4000}}>
                {"Add a collaborator to this project using email id"}
              </div>
              <div className="control">
                <input className="input is-focused" type="text" value={this.state.inputValue} onChange={(evt) => this.updateInputValue(evt)} placeholder="Email Id"/>
              </div>
              <button style={{marginTop:20}} onClick={() => this.inviteUser()} className="button is-success is-danger is-rounded">INVITE</button>
            </center>
          </Rodal>
        </div>
      );
    }
  }
}

Doc.propTypes = {
  showCal: PropTypes.bool,
  teamList: PropTypes.array,
  projectId: PropTypes.string,
  docData: PropTypes.object,
  inviteVisible: PropTypes.bool,
};

const mapStateToProps = state => {
  const { doc, kanban } = state;
  return {
    showCal: doc ? doc.showCal : false,
    teamList: doc.teamList,
    projectId: doc.projectId,
    docData: doc.docData,
    inviteVisible: doc.inviteVisible,
    kanban_data: kanban.kanban_data,
    chatMessages: doc.chatMessages,
    projectName: doc.projectName
  };
};

export default connect(mapStateToProps)(Doc);