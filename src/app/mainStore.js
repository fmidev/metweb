
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import mainReducer from './mainReducer.js'
import sidebarReducer from './sidebarReducer.js'

const mainStore = {}

mainStore.metWebReducer = combineReducers({mainReducer, sidebarReducer})
mainStore.metStore = createStore(mainStore.metWebReducer, applyMiddleware(thunk))

export default mainStore
