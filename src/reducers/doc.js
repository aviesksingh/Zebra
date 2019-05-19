import {
  TOGGLE_CALENDAR, TOGGLE_GANTT, TEAM_LIST_FETCHED, CHANGE_DOC_DATA, SETUP_PROJECT, NEW_PROJECT, SAVE_CONTENT,TOGGLE_INVITE, SETUP_DASH_PROJECTS, CHANGE_DATA, UPDATE_CHAT, UPDATE_TASKS, SET_PROJECT_NAME
  } from "../actions/home";
  
  import { loadUserProfile } from "../utils/apiUtils";
  
  const initialState = {
    showCal: false,
    showGantt: false,
    projectId: "new",
    projectName: "",
    teamList: [],
    chatMessages: [],
    projects: [],
    taskList:[],
    inviteVisible: false,
    docData: {
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
    },
  };
  
  function initializeState() {
    const userProfile = loadUserProfile();
    return Object.assign({}, initialState, userProfile);
  }
  
  export default function doc(state = initializeState(), action = {}) {
    switch (action.type) {
      case TOGGLE_CALENDAR:
        var newVal = false;
        if (state.showCal == false) { newVal = true; }
        return Object.assign({}, state, {
          showCal: newVal,
        });
      case UPDATE_TASKS:
        return Object.assign({}, state, {
          taskList: action.data,
        });
      case SET_PROJECT_NAME:
        return Object.assign({}, state, {
          projectName: action.data,
        });
      case TEAM_LIST_FETCHED:
        return Object.assign({}, state, {
          teamList: action.teamList,
        });
      case CHANGE_DOC_DATA:
        return Object.assign({}, state, {
          docData: action.data,
        });
      case UPDATE_CHAT:
        return Object.assign({}, state, {
          chatMessages: [...state.chatMessages, action.data],
        });
      case SETUP_DASH_PROJECTS:
        return Object.assign({}, state, {
          projects: action.data,
        });
      case SETUP_PROJECT:
        return Object.assign({}, state, {
          projectId: action.data,
          teamList: [],
          docData: {},
          chatMessages: [],
          kanbanUpdated: false,
          projectName: "",
        });
      case TOGGLE_INVITE:
        var newTog = false;
        if (state.inviteVisible === false)
          newTog = true;
        return Object.assign({}, state, {
          inviteVisible: newTog,
        });
      case TOGGLE_GANTT:
        var newVal = false;
        if (state.showGantt == false) { newVal = true; }
        return Object.assign({}, state, {
          showGantt: newVal,
        });
      default:
        return state;
    }
  }
  