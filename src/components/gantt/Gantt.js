/*global gantt*/
import React, { Component } from 'react';
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class Gantt extends Component {
  componentDidMount() {
    gantt.init(this.ganttContainer);
    gantt.parse(this.props.tasks);
   
  }
  
  render() {
    
    return (
        <div
            ref={(input) => { this.ganttContainer = input }}
            style={{width: '100%', height: '200px'}}
        ></div>
    );
    
    
  }
}
