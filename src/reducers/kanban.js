import {
    CHANGE_DATA,
    SETUP_PROJECT,
    CLEAR_KANBAN
    } from "../actions/home";
    
    import { loadUserProfile } from "../utils/apiUtils";
    const emptyKanban = {
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
    const initialState = {
      kanban_data: emptyKanban,
      kanbanUpdated: false,
    };
    
    function initializeState() {
      const userProfile = loadUserProfile();
      return Object.assign({}, initialState, userProfile);
    }
    
    export default function kanban(state = initializeState(), action = {}) {
      switch (action.type) {
        case CHANGE_DATA:
            return Object.assign({}, state, {
                kanban_data: action.data,
                kanbanUpdated: true
            });
        case CLEAR_KANBAN:
            return initialState;
        
        default:
          return state;
      }
    }
    