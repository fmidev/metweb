
import { createStore, combineReducers } from 'redux'
import mainReducer from './mainReducer.js'
import sidebarReducer from './sidebarReducer.js'
import goldenLayoutReducer from 'metoclient-layout/src/reducer.js'

const functions = {}

functions.metWebReducer = combineReducers({mainReducer, sidebarReducer, goldenLayoutReducer})
functions.metStore = createStore(functions.metWebReducer)

export default functions