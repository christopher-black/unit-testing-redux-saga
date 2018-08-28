
import { combineReducers } from 'redux';
import { USER_ACTIONS } from './user.actions';

const user = (state = null, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_USER:
      return action.user || state;
    case USER_ACTIONS.UNSET_USER:
      return null;
    default:
      return state;
  }
};

// The store only accepts one reducer
export default combineReducers({
  user,
});
