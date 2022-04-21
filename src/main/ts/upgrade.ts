import { sync as glob } from 'fast-glob'
import cp, { StdioOptions } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import normalize from 'normalize-path'

export const invoke = (
  cwd: string,
  args: string[],
  cmd: string,
): string | undefined => {
  const stdio: StdioOptions = ['inherit', 'inherit', 'inherit']
  const result = cp.spawnSync(cmd, args, { cwd: normalize(cwd), stdio })

  if (result.error || result.status || result.signal !== null) {
    throw result
  }

  return result.stdout?.toString().trim()
}

export type TFlags = { w?: string; workspaces?: string }

export type TWorkspaces = string[] | string

export type TPkgJson = {
  workspaces?: { packages: string[] } | string[]
}

export const resolveWorkspaces = (
  cwd: string,
  patterns: string[],
): string[] => {
  const entries = glob(patterns, {
    cwd,
    onlyDirectories: true,
    absolute: true,
  })

  return Object.keys(
    entries.reduce<Record<string, boolean>>((m, entry) => {
      try {
        const stat = fs.lstatSync(entry)

        if (stat.isFile()) {
          m[path.dirname(entry)] = true
        }

        if (stat.isDirectory()) {
          m[entry] = true
        }
      } catch {}

      return m
    }, {}),
  )
}

export const readPkg = (cwd: string): TPkgJson =>
  JSON.parse(
    fs.readFileSync(path.resolve(cwd, 'package.json'), { encoding: 'utf8' }),
  )

export const extractWorkspacesFromPkg = (pkg: TPkgJson): string[] =>
  pkg.workspaces
    ? Array.isArray(pkg.workspaces)
      ? pkg.workspaces
      : pkg.workspaces.packages
    : []

export const getWorkspaces = (cwd: string, ws?: TWorkspaces): string[] => {
  const pattern =
    typeof ws === 'string'
      ? ws.split(',')
      : Array.isArray(ws)
      ? ws
      : extractWorkspacesFromPkg(readPkg(cwd))

  return resolveWorkspaces(cwd, pattern)
}

export const upgrade = (cwd: string, flags: TFlags): void => {
  const workspaces = [cwd, ...getWorkspaces(cwd, flags.w || flags.workspaces)]

  workspaces.forEach((ws) => {
    if (fs.existsSync(path.resolve(ws, 'package.json'))) {
      console.log(`invoke npm-upgrade for ${ws}`)

      invoke(ws, process.argv.slice(2), 'npm-upgrade')
    } else {
      console.warn(`${ws} package.json not found`)
    }
  })
}
