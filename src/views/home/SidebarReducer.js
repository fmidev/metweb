
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'

import {
  getApiKey,
  updateActiveProducts,
  addProductToActiveMap,
  removeProductFromActiveMap
} from './core.js'


/* Initialize state */

const initialState = {
  open: false,
  workspaces: [],
  selectedWorkspace: false,
  menu: MenuReader.getMenuJson(getApiKey())
}
Metadata.resolveMetadataForMenu(initialState.menu)

const sidebarReducer = (state = initialState, action) => {

  let newState = Object.assign({}, state)
  console.log(action);

  switch(action.type){

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
      addProductToActiveMap(newState.menu.menu[action.menuIndex].items[action.itemIndex], newState.workspaces[newState.selectedWorkspace])
      return newState

    case 'PRODUCT_OFF':
      newState.menu.menu[action.menuIndex].items[action.itemIndex].active = false
      removeProductFromActiveMap(newState.menu.menu[action.menuIndex].items[action.itemIndex], newState.workspaces[newState.selectedWorkspace])
      return newState

    default:
      return newState
  }

}

export default sidebarReducer
