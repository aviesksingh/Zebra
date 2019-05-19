export const TOGGLE_CALENDAR = "TOGGLE_CALENDAR";
export const TOGGLE_GANTT = "TOGGLE_GANTT";
export const TEAM_LIST_FETCHED = "TEAM_LIST_FETCHED"; 
export const CHANGE_DATA = "CHANGE_DATA"; 
export const CHANGE_DOC_DATA = "CHANGE_DATA";
export const SETUP_PROJECT = "SETUP_PROJECT";
export const NEW_PROJECT = "NEW_PROJECT";
export const SAVE_CONTENT = "SAVE_CONTENT";
export const TOGGLE_INVITE = "TOGGLE_INVITE";
export const SETUP_DASH_PROJECTS = "SETUP_DASH_PROJECTS";
export const UPDATE_CHAT = "UPDATE_CHAT";
export const CLEAR_KANBAN = "CLEAR_KANBAN";
export const UPDATE_TASKS = "UPDATE_TASKS";
export const SET_PROJECT_NAME = "SET_PROJECT_NAME";


export function toggleCalendar() {
    return {
        type: TOGGLE_CALENDAR,
    };
}

export function updateTasks(data) {
    return {
        type: UPDATE_TASKS,
        data: data
    };
}

export function clearKanBan() {
    return {
        type: CLEAR_KANBAN,
    };
}

export function updateChat(msg) {
    return {
        type: UPDATE_CHAT,
        data: msg
    };
}

export function toggleGantt() {
    return {
        type: TOGGLE_GANTT,
    };
}

export function toggleInviteModal() {
    return {
        type: TOGGLE_INVITE,
    };
}

export function setProjectName(name) {
    return {
        type: SET_PROJECT_NAME,
        data:name
    };
}



// Called only when new doc is created
export function setupProject(pid) {
    return {
        type: SETUP_PROJECT,
        data: pid,
    };
} 

export function saveContent(content) {
    return {
        type: SAVE_CONTENT,
        data: content,
    };
}

export function setUpDashProjects(projects) {
    return {
        type: SETUP_DASH_PROJECTS,
        data: projects,
    };
}


export function fetchTeamList(list) {
    var colors = ['#CD5C5C','#008B8B','#C71585','#FF4500','#2E8B57','#FFD700','#9370DB','#66CDAA','#663399','#6A5ACD','#483D8B','#0000CD','#32CD32','#4682B4','#00BFFF','#7B68EE','#A0522D','#696969'];
    var newList = [];
    var i = 0;

    for (var k in list) {
        list[k]["color"] = colors[i];
        newList.push(list[k]);
        i += 1;
    }

    return {
        type: TEAM_LIST_FETCHED,
        teamList: newList
    };
}

export function changeKanbanData(newData) {
    return {
        type: CHANGE_DATA,
        data: newData
    };
} 

export function changeDocData(newData) {
    return {
        type: CHANGE_DOC_DATA,
        data: newData
    };
}