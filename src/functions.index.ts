import "./0-base/env-def";
import { ExpressApp } from "./express/express";

try {
  require("@google-cloud/trace-agent").start();
} catch (e) {
  console.log(`Failed to start @google-cloud/trace-agent`);
}

export const api = ExpressApp;
