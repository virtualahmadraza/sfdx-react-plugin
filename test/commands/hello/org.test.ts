import { expect, test } from '@salesforce/command/lib/test';

describe('hello:org', () => {
  test
    .stdout()
    .command(['hello:org'])
    .it('runs hello:org', (ctx) => {
      expect(ctx.stdout).to.contain(
        'Sfdx react plugin'
      );
    });
});
