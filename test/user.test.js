import 'babel-polyfill'         // Required for testing sagas
import { expect } from 'chai';  // Used to create test conditions
import sinon from 'sinon';      // Used to mock API requests
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware, combineReducers } from 'redux';

// * allows us to call functions beyound the default
import * as api from '../src/user.saga.js';
import userReducer from '../src/user.reducer.js';
import { USER_ACTIONS } from '../src/user.actions';

let store;

// Initializing to an empty object, but here is where you could
// preload your redux state with initial values (from localStorage, perhaps)
const preloadedState = {};
const middlewares = [];
const sagaMiddleware = createSagaMiddleware();
const mockUser = {
  username: 'r2d2',
  id: '123'
};

describe('user reducer', function() {

  // SETUP Called before the tests run
  before(function() {
    middlewares.push(sagaMiddleware);

    store = createStore(
      combineReducers({
        userReducer,
        lastAction, // Used to keep track of the last action
      }),
      preloadedState,
      applyMiddleware(...middlewares),
    );

    sagaMiddleware.run(function* rootSaga() {
      yield all([
        api.default()
      ]);
    });
  });
  // END SETUP

  // TESTS
  it('should initally be null', function(){
    expect(store.getState().userReducer.user).to.equal(null);
  });

  it('should have a user after fetching a valid user', function(done){
    // Sinon mocks a promis for us, returning the mockUser as a response
    api.mock(sinon.stub().resolves(mockUser));

    // Subscribe to events from the store
    const unsubscribe = store.subscribe(() => {
      if(store.getState().lastAction.type === USER_ACTIONS.REQUEST_DONE) {
        expect(store.getState().userReducer.user).to.deep.equal(mockUser);
        unsubscribe(); // Unsubscribe to redux events
        done(); // Complete this portion of the test and move on to the next test
      }
    });

    store.dispatch({ type: USER_ACTIONS.FETCH_USER });
  });

  it('should reject request after fetching an invalid user', function(done){
    // Sinon mocks a promise and rejects it, sending our saga to the catch block
    api.mock(sinon.stub().rejects());

    // Subscribe to events from the store
    const unsubscribe = store.subscribe(() => {
      if(store.getState().lastAction.type === USER_ACTIONS.USER_FETCH_FAILED) {
        expect(store.getState().lastAction.message === 'FORBIDDEN');
        unsubscribe(); // Unsubscribe to redux events
        done(); // Complete this portion of the test and move on to the next test
      }
    });
    // Fetch a user, which should be rejected
    store.dispatch({ type: USER_ACTIONS.FETCH_USER });
  });

  it('should be null after log out', function(){
    store.dispatch({ type: USER_ACTIONS.SET_USER, user: mockUser });
    expect(store.getState().userReducer.user).to.deep.equal(mockUser);
    store.dispatch({ type: USER_ACTIONS.UNSET_USER });
    expect(store.getState().userReducer.user).to.equal(null);
  });
  // END TESTS

  // Called after all tests run
  after (function() {
    console.log('DONE');
  });
});

// Used to keep track of the last action
function lastAction(state = null, action) {
  return action;
}
