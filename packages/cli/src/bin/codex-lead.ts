#!/usr/bin/env node
import process from "node:process";

import { runCli } from "../cli.js";

const result = runCli(process.argv.slice(2), {
  stderr: process.stderr,
  stdout: process.stdout,
});

process.exitCode = result.exitCode;
