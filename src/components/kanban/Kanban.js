/*global gantt*/
import React, { Component } from 'react';
import Board from 'react-trello'
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Faye from 'faye';
import moment from 'moment';
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { toggleCalendar, changeKanbanData } from "../../actions/home";

import './kanban.css';
var newTask = "sds";
var client = new Faye.Client('http://52.15.83.136:3000/newton/');
var dueDate = "12/1/1029";
var _this;
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
var kData = null;

class Kanban extends Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        //fetch from api
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
            
            if (data.result.status === 'success') {
  
              //set Kanban
              //alert(JSON.stringify(data.result.data.tasks));
              var tasks = data.result.data.tasks;
              //alert(JSON.stringify(data.result.data.tasks));
              for (var k in tasks) {
                var task = tasks[k];
                emptyKanban.lanes[parseInt(task.task_status)].cards.push({id: task.task_id, title: task.task_name, due: task.end_date});
              }
              //alert(JSON.stringify(emptyKanban))
              _this.dispatch(changeKanbanData(emptyKanban));
              emptyKanban = {
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
            }
         })
        
    }

    componentDidUpdate() {
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
            
            if (data.result.status === 'success') {
  
              //set Kanban
              //alert(JSON.stringify(data.result.data.tasks));
              var tasks = data.result.data.tasks;
              //alert(JSON.stringify(data.result.data.tasks));
              for (var k in tasks) {
                var task = tasks[k];
                emptyKanban.lanes[parseInt(task.task_status)].cards.push({id: task.task_id, title: task.task_name, due: task.end_date});
              }
              //alert(JSON.stringify(emptyKanban))
              _this.dispatch(changeKanbanData(emptyKanban));
              emptyKanban = {
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
            }
         })
    }


    render() {
        kData = this.props.kanban_data;
        _this = this.props;

        function cardAdded (card, laneId) {
            //alert(_this.projectId);
            var start_date = card.description;
            if (start_date == '') {
                start_date = moment().format('MM-DD-YYYY');
            }
            fetch("http://localhost:5000/create_task",{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'),'user_id':localStorage.getItem('token'),'task_name':card.title,'description':'','end_date':moment(start_date).format('MM-DD-YYYY'),'project_id':_this.projectId})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          //alert(JSON.stringify(data));
          if (data.result.status === 'success') {
            client.publish('/'+_this.projectId, {text: '',type: 'update_kanban', from: localStorage.getItem('name','random'),token: localStorage.getItem('token','')});
          }
       })


        }

        function chngKBData (cardId, sourceLaneId, targetLaneId, position) {
            var oldData = kData;
            var newData = {lanes: [{id: 1,title: 'Planned Tasks',cards: []},{id: 2,title: 'In Progress',cards: []},{id: 3,title: 'Completed',cards: []}]}
            sourceLaneId = parseInt(sourceLaneId);
            targetLaneId = parseInt(targetLaneId);
            var cardList = oldData.lanes[sourceLaneId - 1].cards;
            var cardData = {};
            for (var k in cardList) {
                if (cardList[k].id == cardId) {
                    //delete
                    cardData = oldData.lanes[sourceLaneId - 1].cards[k];
                    
                    oldData.lanes[sourceLaneId - 1].cards.splice(k,1);
                    break;
                }
            }

            oldData.lanes[targetLaneId - 1].cards.push(cardData);
            
            _this.dispatch(changeKanbanData(oldData)); 
            var newStatus = targetLaneId - 1;

            //send to server
            fetch("http://localhost:5000/save_task",{
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({'token':localStorage.getItem('token'),'task_id':cardId,'project_id':_this.projectId,'status':newStatus})
      }).then(function(res){ return res.json(); })
      .then(function(data) { 
          if (data.result.status === 'success') {
            client.publish('/'+_this.projectId, {text: '',type: 'update_kanban', from: localStorage.getItem('name','random'),token: localStorage.getItem('token','')});
          }
       })

        }

        function  handleCardAdd(card, laneId) {
            //alert(JSON.stringify(card))
        }

        var userList = this.props.teamList;
        if(this.props.kanbanUpdated == true) {
            return (
                <center>
                    <Board className="kanban_area" editable  data={_this.kanban_data} draggable={true} handleDragEnd={chngKBData} collapsibleLanes onCardAdd={cardAdded} />
                    
                </center>
            );
        }
        else {
            return (
                <center>
                  <Board className="kanban_area" editable  data={_this.kanban_data} draggable={true} handleDragEnd={chngKBData} collapsibleLanes onCardAdd={cardAdded} />
                </center>
            );
        }
       
    }
}



const mapStateToProps = state => {
    const { kanban, doc } = state;
    return {
        kanban_data: kanban.kanban_data,
        projectId: doc.projectId,
        kanbanUpdated: kanban.kanbanUpdated
    };
};

export default connect(mapStateToProps)(withRouter(Kanban));
