import * as api from 'api'
import { pascalCase } from 'change-case'

const fetchActions = {}

const createAction = (type) => ({type: type})

const requestNetworkError = (type, error) => ({
  type: type,
  error: error,
  networkError: true
})

export const REQUEST_JOBS = 'REQUEST_JOBS'
export const RECEIVE_JOBS_SUCCESS = 'RECEIVE_JOBS_SUCCESS'
export const RECEIVE_JOBS_ERROR = 'RECEIVE_JOBS_ERROR'

fetchActions.jobs = {
  action: createAction(REQUEST_JOBS),
  receiveSuccess: json => ({
    type: RECEIVE_JOBS_SUCCESS,
    count: json.meta.count,
    items: json.data.map((j) => (
      {
        id: j.id,
        createdAt: j.attributes.createdAt,
        initiators: j.attributes.initiators
      }
    ))
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_JOBS_ERROR, error)
}

export const REQUEST_ACCOUNT_BALANCE = 'REQUEST_ACCOUNT_BALANCE'
export const RECEIVE_ACCOUNT_BALANCE_SUCCESS = 'RECEIVE_ACCOUNT_BALANCE_SUCCESS'
export const RECEIVE_ACCOUNT_BALANCE_ERROR = 'RECEIVE_ACCOUNT_BALANCE_ERROR'

fetchActions.accountBalance = {
  action: createAction(REQUEST_ACCOUNT_BALANCE),
  receiveSuccess: json => ({
    type: RECEIVE_ACCOUNT_BALANCE_SUCCESS,
    eth: json.data.attributes.ethBalance,
    link: json.data.attributes.linkBalance
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_ACCOUNT_BALANCE_ERROR, error)
}

export const REQUEST_JOB_SPEC = 'REQUEST_JOB_SPEC'
export const RECEIVE_JOB_SPEC_SUCCESS = 'RECEIVE_JOB_SPEC_SUCCESS'
export const RECEIVE_JOB_SPEC_ERROR = 'RECEIVE_JOB_SPEC_ERROR'

fetchActions.jobSpec = {
  action: createAction(REQUEST_JOB_SPEC),
  receiveSuccess: json => ({
    type: RECEIVE_JOB_SPEC_SUCCESS,
    item: json.data.attributes
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_JOB_SPEC_ERROR, error)
}

export const REQUEST_JOB_SPEC_RUNS = 'REQUEST_JOB_SPEC_RUNS'
export const RECEIVE_JOB_SPEC_RUNS_SUCCESS = 'RECEIVE_JOB_SPEC_RUNS_SUCCESS'
export const RECEIVE_JOB_SPEC_RUNS_ERROR = 'RECEIVE_JOB_SPEC_RUNS_ERROR'

fetchActions.jobSpecRuns = {
  action: createAction(REQUEST_JOB_SPEC_RUNS),
  receiveSuccess: json => ({
    type: RECEIVE_JOB_SPEC_RUNS_SUCCESS,
    items: json.data.map(j => j.attributes),
    runsCount: json.meta.count
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_JOB_SPEC_RUNS_ERROR, error)
}

export const REQUEST_JOB_SPEC_RUN = 'REQUEST_JOB_SPEC_RUN'
export const RECEIVE_JOB_SPEC_RUN_SUCCESS = 'RECEIVE_JOB_SPEC_RUN_SUCCESS'
export const RECEIVE_JOB_SPEC_RUN_ERROR = 'RECEIVE_JOB_SPEC_RUN_ERROR'

fetchActions.jobSpecRun = {
  action: createAction(REQUEST_JOB_SPEC_RUN),
  receiveSuccess: json => ({
    type: RECEIVE_JOB_SPEC_RUN_SUCCESS,
    item: json.data.attributes
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_JOB_SPEC_RUN_ERROR, error)
}

export const REQUEST_CONFIGURATION = 'REQUEST_CONFIGURATION'
export const RECEIVE_CONFIGURATION_SUCCESS = 'RECEIVE_CONFIGURATION_SUCCESS'
export const RECEIVE_CONFIGURATION_ERROR = 'RECEIVE_CONFIGURATION_ERROR'

fetchActions.configuration = {
  action: createAction(REQUEST_CONFIGURATION),
  receiveSuccess: json => ({
    type: RECEIVE_CONFIGURATION_SUCCESS,
    config: json.data.attributes
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_CONFIGURATION_ERROR, error)
}

export const REQUEST_BRIDGES = 'REQUEST_BRIDGES'
export const RECEIVE_BRIDGES_SUCCESS = 'RECEIVE_BRIDGES_SUCCESS'
export const RECEIVE_BRIDGES_ERROR = 'RECEIVE_BRIDGES_ERROR'

fetchActions.bridges = {
  action: createAction(REQUEST_BRIDGES),
  receiveSuccess: json => ({
    type: RECEIVE_BRIDGES_SUCCESS,
    count: json.meta.count,
    items: json.data.map(b => b.attributes)
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_BRIDGES_ERROR, error)
}

export const REQUEST_BRIDGESPEC = 'REQUEST_BRIDGESPEC'
export const RECEIVE_BRIDGESPEC_SUCCESS = 'RECEIVE_BRIDGESPEC_SUCCESS'
export const RECEIVE_BRIDGESPEC_ERROR = 'RECEIVE_BRIDGESPEC_ERROR'

fetchActions.bridgeSpec = {
  action: createAction(REQUEST_BRIDGESPEC),
  receiveSuccess: json => ({
    type: RECEIVE_BRIDGESPEC_SUCCESS,
    name: json.name,
    url: json.url,
    confirmations: json.defaultConfirmations
  }),
  receiveNetworkError: error => requestNetworkError(RECEIVE_BRIDGESPEC_ERROR, error)
}

function sendFetchActions (type, ...getArgs) {
  return dispatch => {
    const {action, receiveSuccess, receiveNetworkError} = fetchActions[type]
    const apiGet = api['get' + pascalCase(type)]

    dispatch(action)
    return apiGet(...getArgs)
      .then(json => dispatch(receiveSuccess(json)))
      .catch(error => dispatch(receiveNetworkError(error)))
  }
}

export const REQUEST_SESSION = 'REQUEST_SESSION'
export const RECEIVE_SESSION_SUCCESS = 'RECEIVE_SESSION_SUCCESS'
export const RECEIVE_SESSION_ERROR = 'RECEIVE_SESSION_ERROR'

function sendSessionRequest (data) {
  return dispatch => {
    dispatch(createAction(REQUEST_SESSION))
    return api.postSessionRequest(data)
      .then((json) => dispatch(createAction(RECEIVE_SESSION_SUCCESS)))
      .catch(error => dispatch(requestNetworkError(RECEIVE_SESSION_ERROR, error)))
  }
}

export const fetchJobs = (page, size) => sendFetchActions('jobs', page, size)
export const fetchAccountBalance = () => sendFetchActions('accountBalance')
export const fetchJobSpec = (id) => sendFetchActions('jobSpec', id)
export const fetchJobSpecRuns = (id, page, size) => sendFetchActions('jobSpecRuns', id, page, size)
export const fetchJobSpecRun = (id) => sendFetchActions('jobSpecRun', id)
export const fetchConfiguration = () => sendFetchActions('configuration')
export const fetchBridges = (page, size) => sendFetchActions('bridges', page, size)
export const fetchBridgeSpec = (name) => sendFetchActions('bridgeSpec', name)

export const submitSessionRequest = (data) => sendSessionRequest(data)
