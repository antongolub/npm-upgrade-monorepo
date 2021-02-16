import cp from 'child_process'
import path from 'path'

import {
  extractWorkspacesFromPkg,
  getWorkspaces,
  invoke,
  upgrade,
} from '../../main/ts'
import { formatFlags,parseFlags } from './helpers/flags'

const fixtures = path.resolve(__dirname, '../fixtures')

describe('extractWorkspacesFromPkg()', () => {
  const cases = [
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
    expect(getWorkspaces(path.resolve(fixtures, 'regular-monorepo'))).toEqual(
      ['a', 'b'].map((p) =>
        path.resolve(fixtures, 'regular-monorepo', 'packages', p),
      ),
    )
  })

  it('throws error if root-level pkg json is not found', () => {
    expect(() => getWorkspaces('/fooo/bar')).toThrowError()
  })

  it('uses process.cwd as default', () => {
    expect(getWorkspaces(process.cwd())).toEqual([])
  })
})

describe('exec', () => {
  const cwd = process.cwd()
  const argv = process.argv.slice(2)
  const cmd = 'npm-upgrade'
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
        status: parseInt(status),
        signal: null, // eslint-disable-line
        pid: process.pid,
      }
    })

  describe('bin', () => {
    it('applies upgrade to cwd', () => {
      require('../../main/ts/cli')

      expect(fakeCpSync).toHaveBeenCalledWith('npm-upgrade', argv, {
        cwd,
        stdio,
      })
    })
  })

  describe('upgrade()', () => {
    it('applies `npm-upgrade` for each pkg dir', () => {
      upgrade(path.resolve(fixtures, 'regular-monorepo'), {})

      const cwds = ['a', 'b', '..'].map((p) =>
        path.resolve(fixtures, 'regular-monorepo', 'packages', p),
      )

      cwds.forEach((_cwd) =>
        expect(fakeCpSync).toHaveBeenCalledWith('npm-upgrade', argv, {
          cwd: _cwd,
          stdio,
        }),
      )
    })
  })

  describe('invoke()', () => {
    it('runs `npm-upgrade` cp with proper args', () => {
      expect(invoke(cwd, argv, cmd)).toBe('some result')
      expect(fakeCpSync).toHaveBeenCalledWith(cmd, argv, { cwd, stdio })

      expect(invoke('foo', ['bar'], 'baz')).toBe('some result')
      expect(fakeCpSync).toHaveBeenCalledWith('baz', ['bar'], {
        cwd: 'foo',
        stdio,
      })
    })

    it('throws internal errors', () => {
      expect(() =>
        invoke(
          cwd,
          formatFlags({
            stderr: 'some error',
            status: '1',
          }),
          cmd,
        ),
      ).toThrow()
    })
  })

  afterAll(jest.restoreAllMocks)
})
