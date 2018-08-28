import { put, takeLatest } from 'redux-saga/effects';
import { USER_ACTIONS } from './user.actions';
import { callUser as originalCallUser } from './user.requests';

let callUser = originalCallUser;

// Used for unit testing
export function mock(mockedCallUser) {
  callUser = mockedCallUser || originalFetchData;
}

// worker Saga: will be fired on "FETCH_USER" actions
function* fetchUser() {
  try {
    yield put({ type: USER_ACTIONS.REQUEST_START });
    const user = yield callUser();
    yield put({
      type: USER_ACTIONS.SET_USER,
      user,
    });
    yield put({
      type: USER_ACTIONS.REQUEST_DONE,
    });
  } catch (error) {
    yield put({
      type: USER_ACTIONS.REQUEST_DONE,
    });
    yield put({
      type: USER_ACTIONS.USER_FETCH_FAILED,
      message: error.data || "FORBIDDEN",
    });
  }
}

function* userSaga() {
  yield takeLatest(USER_ACTIONS.FETCH_USER, fetchUser);
}

export default userSaga;
