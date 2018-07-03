import axios from 'axios'

export function authorize(user) {
  console && console.log("Authorizing", user);
  // POST /authorize
  return (dispatch, getState) => {
    return axios.post(USERAPI+'/authorize',
      { /* Options */
        params: { /* Request body */
          user: user
        },
        headers: {
          'Content-Type': 'application/json',
        }
      })
    .then((response) => dispatch({
      type: 'AUTHORIZED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err
    }))
  }
}

export function loadSession(user){

  return (dispatch) => {

    return axios.get(USERAPI+'/session',
      { /* Options */
        params: JSON.stringify({ /* Request body */
          user: user
        }),
        headers: {
            'Content-Type': 'application/json',
        }
      })
    .then((response) => dispatch({
      type: 'SESSION_SAVED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err, response: response
    }))
  }

}

export function saveSession(workspaces, user){

  // POST /session
  return (dispatch) => {
    let sessionData = {};
    workspaces.forEach((workspace) => {
      sessionData[workspace.title] = [];
      for(var i = 0; i < workspace.getNumWindows(); i++){
        sessionData[workspace.title].push(workspace.get(i)); // One metoclient config per loop
      }
    })

    return axios.post(USERAPI+'/session',
      { /* Options */
        params: { /* Request body */
          sessions: sessionData,
          user: user
        },
        headers: {
            'Content-Type': 'application/json',
        }
      })
    .then((response) => dispatch({
      type: 'SESSION_SAVED', data: response.data
    }))
    .catch((response) => dispatch({
      type: 'HTTP_ERROR', err: response.err, response: response
    }))

  }
}
