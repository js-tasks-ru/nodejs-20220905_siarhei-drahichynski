const Validator = require('../Validator');
const {expect, assert} = require('chai');

describe('testing-configuration-logging/unit-tests', () => {
  describe('constructor', () => {
    it('at least one field', () => {
      assert.throws(() => {
        new Validator({});
      }, Error);
    });

    it('throws on forbidden types', () => {
      assert.throws(() => {
        new Validator({forbidden: {type: 'another'}});
      }, Error);
    });

    it('throws on missing required fields', () => {
      assert.throws(() => {
        new Validator({missing: {type: 'string', min: 0}});
      }, Error);
      assert.throws(() => {
        new Validator({missing: {type: 'string', max: 0}});
      }, Error);
    });

    it('not thows on valid fields', () => {
      assert.doesNotThrow(() => {
        new Validator({valid: {type: 'string', min: 0, max: 10}});
      });
    });
  });

  describe('String Validator', () => {
    it('string length', () => {
      const validator = new Validator({
        name: {
          type: 'string', min: 3, max: 6,
        },
      });

      const errorsLess = validator.validate({name: '12'});
      const errorsBottom = validator.validate({name: '123'});
      const errorsMiddle = validator.validate({name: '12345'});
      const errorsTop = validator.validate({name: '123456'});
      const errorsGreater = validator.validate({name: 'giovanni giorgio'});

      expect(errorsLess).to.have.length(1);
      expect(errorsLess[0]).to.have.property('field').and.to.be.equal('name');
      expect(errorsLess[0]).to.have.property('error').and.to.be.equal('too short, expect 3, got 2');

      expect(errorsBottom).to.have.length(0);
      expect(errorsMiddle).to.have.length(0);
      expect(errorsTop).to.have.length(0);

      expect(errorsGreater).to.have.length(1);
      expect(errorsGreater[0]).to.have.property('field').and.to.be.equal('name');
      expect(errorsGreater[0]).to.have.property('error').and.to.be.equal('too long, expect 6, got 16');
    });

    it('error on wrong type', () => {
      const validator = new Validator({
        name: {
          type: 'string', min: 3, max: 6,
        },
      });

      const errors = validator.validate({name: 42});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('name');
      expect(errors[0]).to.have.property('error').and.to.be.equal(`expect string, got number`);
    });
  });

  describe('Number Validator', () => {
    it('number length', () => {
      const validator = new Validator({
        age: {
          type: 'number', min: 3, max: 6,
        },
      });

      const errorsLess = validator.validate({age: 1});
      const errorsBottom = validator.validate({age: 3});
      const errorsMiddle = validator.validate({age: 5});
      const errorsTop = validator.validate({age: 6});
      const errorsGreater = validator.validate({age: 81});

      expect(errorsLess).to.have.length(1);
      expect(errorsLess[0]).to.have.property('field').and.to.be.equal('age');
      expect(errorsLess[0]).to.have.property('error').and.to.be.equal('too little, expect 3, got 1');

      expect(errorsBottom).to.have.length(0);
      expect(errorsMiddle).to.have.length(0);
      expect(errorsTop).to.have.length(0);

      expect(errorsGreater).to.have.length(1);
      expect(errorsGreater[0]).to.have.property('field').and.to.be.equal('age');
      expect(errorsGreater[0]).to.have.property('error').and.to.be.equal('too big, expect 6, got 81');
    });

    it('error on wrong type', () => {
      const validator = new Validator({
        age: {
          type: 'number', min: 3, max: 6,
        },
      });

      const errors = validator.validate({age: 'giovanni giorgio'});

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal('age');
      expect(errors[0]).to.have.property('error').and.to.be.equal(`expect number, got string`);
    });
  });
});
