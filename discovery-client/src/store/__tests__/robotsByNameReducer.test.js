// @flow
// discovery client reducer
import {
  mockHealthResponse,
  mockServerHealthResponse,
  mockHealthErrorJsonResponse,
} from '../../__fixtures__/health'

import * as Actions from '../actions'
import { reducer, robotsByNameReducer } from '../reducer'

describe('robotsByName reducer', () => {
  it('should return an empty initial state under robotsByName in the root reducer', () => {
    const state = reducer(undefined, ({}: any))
    expect(state.robotsByName).toEqual({})
  })

  it('should not overwrite state if "client:INITIALIZE_STATE" action has no robots', () => {
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: null,
        serverHealth: null,
      },
    }
    const action = Actions.initializeState({})
    const state = robotsByNameReducer(initialState, action)

    expect(state).toBe(initialState)
  })

  it('should overwrite state with robots from "client:INITIALIZE_STATE"', () => {
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: null,
        serverHealth: null,
      },
    }

    const action = Actions.initializeState({
      initialRobots: [
        {
          name: 'opentrons-1',
          health: mockHealthResponse,
          serverHealth: mockServerHealthResponse,
          addresses: [],
        },
        {
          name: 'opentrons-2',
          health: null,
          serverHealth: mockServerHealthResponse,
          addresses: [],
        },
        {
          name: 'opentrons-3',
          health: mockHealthResponse,
          serverHealth: null,
          addresses: [],
        },
      ],
    })
    const state = robotsByNameReducer(initialState, action)

    expect(state).toEqual({
      'opentrons-1': {
        name: 'opentrons-1',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
      'opentrons-2': {
        name: 'opentrons-2',
        health: null,
        serverHealth: mockServerHealthResponse,
      },
      'opentrons-3': {
        name: 'opentrons-3',
        health: mockHealthResponse,
        serverHealth: null,
      },
    })
  })

  it('should handle an "mdns:SERVICE_FOUND action for a new robot', () => {
    const action = Actions.serviceFound({
      name: 'opentrons-dev',
      ip: '127.0.0.1',
      port: 31950,
    })
    const initialState = {}

    expect(robotsByNameReducer(initialState, action)).toEqual({
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: null,
        serverHealth: null,
      },
    })
  })

  it('should handle an "mdns:SERVICE_FOUND action for an existing robot', () => {
    const action = Actions.serviceFound({
      name: 'opentrons-dev',
      ip: '127.0.0.1',
      port: 31950,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: ({ mockHealth: true }: any),
        serverHealth: ({ mockServerHealth: true }: any),
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    // ensure state is neither mutated nor recreated
    expect(nextState).toEqual(initialState)
    expect(nextState).toBe(initialState)
  })

  it('should handle an "http:HEALTH_POLLED action for a new robot', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: mockHealthResponse,
      serverHealth: mockServerHealthResponse,
      healthError: null,
      serverHealthError: null,
    })
    const initialState = {}
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toEqual({
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    })
  })

  it('should handle a good "http:HEALTH_POLLED action for an existing robot', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: mockHealthResponse,
      serverHealth: mockServerHealthResponse,
      healthError: null,
      serverHealthError: null,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: null,
        serverHealth: null,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toEqual({
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    })
  })

  it('should do nothing with a bad health poll', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: null,
      serverHealth: null,
      healthError: mockHealthErrorJsonResponse,
      serverHealthError: mockHealthErrorJsonResponse,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    // ensure state has neither mutated nor changed reference
    expect(nextState).toEqual(initialState)
    expect(nextState).toBe(initialState)
  })

  it('should be able to do a partial update to health', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: mockHealthResponse,
      serverHealth: null,
      healthError: null,
      serverHealthError: mockHealthErrorJsonResponse,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: null,
        serverHealth: mockServerHealthResponse,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toEqual({
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    })
  })

  it('should be able to do a partial update to serverHealth', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: null,
      serverHealth: mockServerHealthResponse,
      healthError: mockHealthErrorJsonResponse,
      serverHealthError: null,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: null,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toEqual({
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    })
  })

  it('should not update state if new poll results are deep equal', () => {
    const action = Actions.healthPolled({
      ip: '127.0.0.1',
      port: 31950,
      health: mockHealthResponse,
      serverHealth: mockServerHealthResponse,
      healthError: null,
      serverHealthError: null,
    })
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    // ensure state has neither mutated nor changed reference
    expect(nextState).toEqual(initialState)
    expect(nextState).toBe(initialState)
  })

  it('should handle a "client:REMOVE_ROBOT" action for an existing robot', () => {
    const action = Actions.removeRobot('opentrons-dev')
    const initialState = {
      'opentrons-dev': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toEqual({})
  })

  it('should noop "client:REMOVE_ROBOT" is robot not in state', () => {
    const action = Actions.removeRobot('opentrons-dev')
    const initialState = {
      'opentrons-other': {
        name: 'opentrons-dev',
        health: mockHealthResponse,
        serverHealth: mockServerHealthResponse,
      },
    }
    const nextState = robotsByNameReducer(initialState, action)

    expect(nextState).toBe(initialState)
  })
})
