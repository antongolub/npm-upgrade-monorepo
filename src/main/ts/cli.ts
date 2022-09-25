#!/usr/bin/env node

import process from 'node:process'

import minimist from 'minimist'

import { TFlags, upgrade } from './upgrade'

upgrade(process.cwd(), minimist(process.argv.slice(2)) as TFlags)
