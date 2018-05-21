
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'

import {
  getCookie,
  getApiKey,
  updateActiveProducts,
  activateProductInSelectedWindow,
  deactivateProductInSelectedWindow,
  genericCRUD
} from './coreFunctions.js'

// Initialize state: store.getState().sidebarReducer
const initialState = {
  open: false,
  workspaces: [],
  selectedWorkspace: false,
  menu: { menu: [] },
  user: { userName: "Guest" }
}

// Handle dispatched actions
const sidebarReducer = (state = initialState, action) => {

  let newState = Object.assign({}, state)

  switch(action.type){

    case 'LOGGED_IN':
      newState.user.crowdToken = getCookie("crowd.token_key")
      if(newState.user.crowdToken){
        // Ideally, get user info from backend here
        newState.user.userName = "Logged in"
      }
      return newState

    case 'SAVE_SESSION':
      console.log(newState);
      genericCRUD('GET', '/save', newState, function(res){
        console.log("Got imagined HTTP response.", res)

        // dispatch({type: 'SAVED_SESSION'})
        // Dispatching inside action. Do we need redux-thunk for this?
      })
      // Save session as is.
      return newState

    case 'SAVED_SESSION':
      // Question: update session with server data always? How to make sure view doesn't get tangled
      console.log("Callback triggered: "+action.type);
      return newState

    case 'MENU_UPDATED':
      newState.menu = MenuReader.getMenuJson()
      return newState

    case 'TOGGLE_SIDEBAR':
      newState.open = !newState.open
      return newState

    case 'NEW_WORKSPACE':
      newState.workspaces[action.index] = action.workspace
      return newState

    case 'CHANGE_SIDEBAR_TARGET':
      newState.selectedWorkspace = action.index
      return newState

    case 'CHANGE_WINDOW_SELECTION':
      newState.menu = updateActiveProducts(newState.menu, newState.workspaces[newState.selectedWorkspace])
      return newState

    case 'TOGGLE_PRODUCTLIST':
      newState.menu.menu[action.menuIndex].open = !newState.menu.menu[action.menuIndex].open
      return newState

    case 'PRODUCT_ON':
      newState.menu.menu[action.menuIndex].items[action.itemIndex].active = true
      activateProductInSelectedWindow(newState.menu.menu[action.menuIndex].items[action.itemIndex], newState.workspaces[newState.selectedWorkspace])
      return newState

    case 'PRODUCT_OFF':
      newState.menu.menu[action.menuIndex].items[action.itemIndex].active = false
      deactivateProductInSelectedWindow(newState.menu.menu[action.menuIndex].items[action.itemIndex], newState.workspaces[newState.selectedWorkspace])
      return newState

    default:
      return newState
  }

}

export default sidebarReducer
