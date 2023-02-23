import {expect, test} from '@oclif/test'

describe('reactforce', () => {
  test
  .stdout()
  .command(['reactforce'])
  .it('runs reactforce', (ctx, done) => {
    expect(ctx.stdout).to.contain('Welcome');
    done();
  })

  test
  .stdout()
  .command(['reactforce', '--version'])
  .it('runs reactforce --version', (ctx) => {
    expect(ctx.stdout).to.contain('version');
  })
})
