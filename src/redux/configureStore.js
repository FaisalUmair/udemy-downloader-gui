import { createStore, applyMiddleware } from "redux"

import { persistStore, persistReducer, createTransform } from "redux-persist"

import createElectronStorage from "redux-persist-electron-storage"

import thunk from "redux-thunk"

import rootReducer from "./rootReducer"

const ElectronStore = require("electron-store")

const electronStore = new ElectronStore()

const transform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    //console.log(inboundState);
    const downloads = JSON.parse(JSON.stringify(inboundState))
    for (var courseid in downloads) {
      downloads[courseid].downloadInstance = null
      if (downloads[courseid].status === "waiting") {
        downloads[courseid].status = null
      }
    }
    return downloads
  },
  (outboundState, key) => {
    return outboundState
  },
  { whitelist: ["downloads"] }
)

const persistConfig = {
  key: "root",
  storage: createElectronStorage(electronStore),
  blacklist: ["courses", "dashboard"],
  transforms: [transform],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(persistedReducer, applyMiddleware(thunk))

let persistor = persistStore(store)

persistor.purge()

export { store, persistor }
