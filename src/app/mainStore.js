
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import mainReducer from './mainReducer.js'
import sidebarReducer from './sidebarReducer.js'
import goldenLayoutReducer from 'metoclient-layout/src/reducer.js'

const mainStore = {}

mainStore.metWebReducer = combineReducers({mainReducer, sidebarReducer, goldenLayoutReducer})
mainStore.metStore = createStore(mainStore.metWebReducer, applyMiddleware(thunk))

export default mainStore