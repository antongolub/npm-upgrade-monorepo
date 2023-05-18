import cp from 'node:child_process'
import path from 'node:path'
import normalize from 'normalize-path'

import {
  extractWorkspacesFromPkg,
  getWorkspaces,
  invokeUpdate,
  TPkgJson,
  upgrade,
} from '../../main/ts'
import { formatFlags, parseFlags } from './helpers/flags'

const cwd = normalize(process.cwd())
const fixtures = path.resolve(__dirname, '../fixtures')

describe('extractWorkspacesFromPkg()', () => {
  const cases: [TPkgJson, string[]][] = [
    [{}, []],
    [{ workspaces: undefined }, []],
    [{ workspaces: ['foo'] }, ['foo']],
    [{ workspaces: { packages: ['bar'] } }, ['bar']],
  ]

  cases.forEach(([pkgJson, result]) => {
    expect(extractWorkspacesFromPkg(pkgJson)).toEqual(result)
  })
})

describe('getWorkspaces()', () => {
  it('returns ws absolute paths for monorepo', () => {
    // https://github.com/sindresorhus/globby/issues/130
    expect(getWorkspaces(path.resolve(fixtures, 'regular-monorepo'))).toEqual(
      ['a', 'b'].map((p) =>
        normalize(path.resolve(fixtures, 'regular-monorepo', 'packages', p)),
      ),
    )
  })

  it('throws error if root-level pkg json is not found', () => {
    expect(() => getWorkspaces('/fooo/bar')).toThrowError()
  })

  it('uses process.cwd as default', () => {
    expect(getWorkspaces(cwd)).toEqual([])
  })
})

describe('exec', () => {
  const argv = process.argv.slice(2)
  const platform = process.platform
  const cmd = platform === 'win32' ? 'npx.cmd' : 'npx'
  const stdio = ['inherit', 'inherit', 'inherit']
  const fakeCpSync = jest
    .spyOn(cp, 'spawnSync')
    .mockImplementation((_cmd, _argv = []) => {
      const { stdout = '  some result    ', status = '0' } = parseFlags(
        _argv as string[],
      )

      return {
        stdout: Buffer.from(stdout),
        stderr: Buffer.from(''),
        output: [],
        status: Number.parseInt(status),
        signal: null, // eslint-disable-line
        pid: process.pid,
      }
    })

  describe('bin', () => {
    it('applies upgrade to cwd', () => {
      require('../../main/ts/cli')

      expect(fakeCpSync).toHaveBeenCalledWith(cmd, ['npm-upgrade', ...argv], {
        cwd,
        stdio,
      })
    })
  })

  describe('upgrade()', () => {
    it('applies `npm-upgrade` for each pkg dir', () => {
      upgrade(path.resolve(fixtures, 'regular-monorepo'), {})

      const cwds = ['a', 'b', '..'].map((p) =>
        normalize(path.resolve(fixtures, 'regular-monorepo', 'packages', p)),
      )

      cwds.forEach((_cwd) =>
        expect(fakeCpSync).toHaveBeenCalledWith(cmd, ['npm-upgrade', ...argv], {
          cwd: _cwd,
          stdio,
        }),
      )
      expect(fakeCpSync).toBeCalledTimes(3)
    })

    it('handles -w/worspaces flag', () => {
      upgrade(path.resolve(fixtures, 'regular-monorepo'), { w: 'packages/b' })

      const cwds = ['b', '..'].map((p) =>
        normalize(path.resolve(fixtures, 'regular-monorepo', 'packages', p)),
      )

      cwds.forEach((_cwd) =>
        expect(fakeCpSync).toHaveBeenCalledWith(cmd, ['npm-upgrade', ...argv], {
          cwd: _cwd,
          stdio,
        }),
      )
      expect(fakeCpSync).toBeCalledTimes(2)
    })
  })

  describe('invoke()', () => {
    it('runs `npm-upgrade` cp with proper args', () => {
      expect(invokeUpdate(cwd, ['foo', '-w', 'packages/*'])).toBe('some result')
      expect(fakeCpSync).toHaveBeenCalledWith(cmd, ['npm-upgrade', 'foo'], { cwd, stdio })

      expect(invokeUpdate('foo', ['baz'])).toBe('some result')
      expect(fakeCpSync).toHaveBeenCalledWith(cmd, ['npm-upgrade', 'baz'], {
        cwd: 'foo',
        stdio,
      })
    })

    it('throws internal errors', () => {
      expect(() =>
        invokeUpdate(
          cwd,
          formatFlags({
            stderr: 'some error',
            status: '1',
          }),
        ),
      ).toThrow()
    })
  })

  afterEach(jest.clearAllMocks)

  afterAll(jest.restoreAllMocks)
})
