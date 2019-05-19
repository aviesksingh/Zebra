import React, { Component } from "react";
import BigCalendar from 'react-big-calendar-like-google';
import moment from 'moment';
import events from './events';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import "../../../node_modules/react-big-calendar-like-google/lib/css/react-big-calendar.css";

let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
BigCalendar.momentLocalizer(moment); 

class MainCalendar extends Component {
    render() {
        return (
            <BigCalendar
            {...this.props}
            events={this.props.taskList}
            views={allViews}
            step={60}
            defaultDate={new Date()}
        />
        );
    }
   
   
}

const mapStateToProps = state => {
    const { doc } = state;
    return {
      taskList: doc.taskList
    };
  };
  
  export default connect(mapStateToProps)(MainCalendar);
