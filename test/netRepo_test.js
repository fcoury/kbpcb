const { expect } = require('chai');

const NetRepo = require('../netRepo');

describe('NetRepo', () => {
  it('returns instance', () => {
    expect(NetRepo.instance).to.haveOwnProperty('nets');
  });
});
