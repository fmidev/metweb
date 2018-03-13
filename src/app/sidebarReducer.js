
import SourceCapabilitiesReader from './SourceCapabilitiesReader.js'
import Metadata from './Metadata.js'

import {
  getApiKey,
  updateActiveProducts,
  activateProductInSelectedWindow,
  deactivateProductInSelectedWindow
} from './coreFunctions.js'

// Initialize state: store.getState().sidebarReducer
const initialState = {
  open: false,
  workspaces: [],
  selectedWorkspace: false,
  menu: {}
}

// Handle dispatched actions
const sidebarReducer = (state = initialState, action) => {

  let newState = Object.assign({}, state)

  switch(action.type){

    case 'MENU_UPDATED':
      newState.menu = SourceCapabilitiesReader.getMenuJson()
      console.log(newState.menu);
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

SourceCapabilitiesReader.setMenuJson(getApiKey(), function(){
  sidebarReducer(undefined, {type: "MENU_UPDATED"})
})

export default sidebarReducer
