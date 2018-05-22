
import mainStore from './mainStore.js'
import { getCookie, notify } from './coreFunctions.js'

// Handle dispatched actions
const mainReducer = (state, action) => {

  let newState = {
    user: { userName: "Guest" },
    errors: [],
    ...state
  }

  console.log(action)
  console.log(state)
  console.log(newState)

  switch(action.type){

    /* Backend talk */
    case 'LOG_IN':
      newState.user.crowdToken = getCookie("crowd.token_key")
      if(newState.user.crowdToken){
        newState.user.userName = "Authorizing..."
      }
      return newState

    case 'AUTHORIZED':
      // Change state (user's name)
      newState.user = { ...state.user, name: action.data.user.userName }
      return newState

    case 'SESSION_LOADED':
      // Change state
      return newState

    case 'SESSION_SAVED':
      console.log("SESSION_SAVED", action.data);
      return newState

    case 'HTTP_ERROR':
      let newError = action.err || {msg: "💥 Failed" + (action.response && action.response.config.method ? " "+action.response.config.method.toUpperCase() : " request" ) + (action.response && action.response.config.url ? " to "+action.response.config.url : "" )}
      let errorList = ""
      newError.read = false
      newState.errors.push(newError)
      newState.errors.forEach((error) => {
        if(!error.read){
          notify(error.msg)
          error.read = true
        }
      })
      return newState

    default:
      return newState

  }

}

export default mainReducer;
