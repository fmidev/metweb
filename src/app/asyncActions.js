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

export function saveSession(){
  // POST /session
  return (dispatch, getState) => {
    console.log(getState().goldenLayoutReducer)
    return axios.post(USERAPI+'/session', {
      user: getState().mainReducer.user,
      sessionData: getState().goldenLayoutReducer
    })
    .then((response) => dispatch({
      type: 'SESSION_SAVED', data: response.data
    }))
    .catch((response) => dispatch({ 
      type: 'HTTP_ERROR', err: response.err, response: response
    }))
  }
}