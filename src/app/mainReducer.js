
import mainStore from './mainStore.js'
import { getCookie } from './coreFunctions.js'

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
      newState.errors.push = action.err
      console.log("new HTTP_ERROR", newState.errors);
      return newState

    default:
      return newState

  }

}

export default mainReducer;
