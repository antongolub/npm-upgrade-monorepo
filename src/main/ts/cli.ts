#!/usr/bin/env node

import minimist from 'minimist'
import process from 'node:process'

import { TFlags, upgrade } from './upgrade'

upgrade(process.cwd(), minimist(process.argv.slice(2)) as TFlags)
