

import store from './mainStore.js'

import {
  getCookie,
  genericCRUD
} from './coreFunctions.js'

// Initialize state: store.getState().mainReducer
const initialState = {
  user: { userName: "Guest" }
}

// Handle dispatched actions
const mainReducer = (state = initialState, action) => {

  let newState = Object.assign({}, state)
  let payLoad = {}

  switch(action.type){

    /* Backend talk */

    case 'AUTHORIZE':
      // POST /authorize
      /*
        example payload:
        { user: { userToken: user.userToken } }
      */
      return newState

    case 'AUTHORIZED':
      // Change state (user's name)
      return newState

    case 'LOAD_SESSION':
      // GET /session
      return newState

    case 'SESSION_LOADED':
      // Change state
      return newState

    case 'SAVE_SESSION':
      // PUT /session
      genericCRUD('PUT', '/session', action.payload, function(res){
        console.log("Got imagined HTTP response:", res)
        // dispatch({type: 'SAVED_SESSION'})
        // Dispatching inside action. We probably need redux-thunk for this?
      })
      return newState

    case 'SESSION_SAVED':
      // Question: update session with server data always? How to make sure view doesn't get tangled
      console.log("Callback triggered: "+action.type);
      return newState

    case 'LOG_IN':
      newState.user.crowdToken = getCookie("crowd.token_key")
      if(newState.user.crowdToken){
        newState.user.userName = "Authorizing..."
      }
      // dispatch({type: 'AUTHORIZE', payload: newState.user})
      return newState

    default:
      return newState

  }

}

export default mainReducer
