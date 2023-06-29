// Load polyfills (once, on the top of our web app)
import "core-js/stable";
import "regenerator-runtime/runtime";

import "./index.css";

/**
 * Frontend code running in browser
 */
import React, { StrictMode } from "react";
import { hydrate } from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { buildDependencies } from "src/components/di/Dependencies";
import { DependenciesContext } from "src/components/di/DependenciesContext";
import ConfigContext from "../components/ConfigContext";
import { Config } from "../server/config";
import App from "./App";

const config = (window as any).__CONFIG__ as Config;
delete (window as any).__CONFIG__;

const basename = config.app.URL.match(/^(?:https?:\/\/)?[^\/]+(\/?.+)?$/i)?.[1];
const dependencies = buildDependencies(config.app.BACKEND_URL);

hydrate(
  <StrictMode>
    <ConfigContext.Provider value={config}>
      <DependenciesContext.Provider value={dependencies}>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </DependenciesContext.Provider>
    </ConfigContext.Provider>
  </StrictMode>,
  document.querySelector("#root"),
);
