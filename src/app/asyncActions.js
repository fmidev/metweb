import axios from 'axios'

export function authorize() {
  // POST /authorize
  return (dispatch, getState) => {
    return axios.post(USERAPI+'/authorize', {
      user: getState().mainReducer.user
    })
    .then((response) => dispatch({
      type: 'AUTHORIZED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}

export function loadSession(){
  // GET /session
  return (dispatch, getState) => {
    return axios.get(USERAPI+'/session', {
      user: getState().mainReducer.user
    })
    .then((response) => dispatch({
      type: 'SESSION_LOADED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}

export function saveSession(workspaces){
  // POST /session
  return (dispatch) => {
    let sessionData = [];
    workspaces.forEach((workspace) => {
      sessionData[workspace.title] = [];
      for(var i = 0; i < workspace.getNumWindows(); i++){
        sessionData[workspace.title].push(workspace.get(i)); // One metoclient config per loop
      }
    })
    console.log("DB-ready cake", sessionData);
    return axios.post(USERAPI+'/session', sessionData)
    .then((response) => dispatch({
      type: 'SESSION_SAVED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err, response: response
    }))
  }
}
