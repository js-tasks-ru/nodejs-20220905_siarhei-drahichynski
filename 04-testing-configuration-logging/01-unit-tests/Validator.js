module.exports = class Validator {
  constructor(rules) {
    this._validateConstructor(rules);

    this.rules = rules;
  }

  _validateConstructor(rules) {
    if (!Object.keys(rules).length) {
      throw new Error('At least one rule required');
    }

    const forbiddenField = Object.entries(rules).find(([ruleName, rule]) => {
      return rule.type !== 'string' && rule.type !== 'number';
    });

    if (forbiddenField) {
      throw new Error(`Rule ${forbiddenField[0]} has forbidden type - ${forbiddenField[1].type}, expected string or number`);
    }

    const missing = Object.entries(rules).find(([ruleName, rule]) => rule.min == null || rule.max == null);

    if (missing) {
      throw new Error(`${missing[0]} is lacking required fields`);
    }
  }

  validate(obj) {
    const errors = [];

    for (const field of Object.keys(this.rules)) {
      const rules = this.rules[field];

      const value = obj[field];
      const type = typeof value;

      if (type !== rules.type) {
        errors.push({field, error: `expect ${rules.type}, got ${type}`});
        return errors;
      }

      switch (type) {
        case 'string':
          if (value.length < rules.min) {
            errors.push({field, error: `too short, expect ${rules.min}, got ${value.length}`});
          }
          if (value.length > rules.max) {
            errors.push({field, error: `too long, expect ${rules.max}, got ${value.length}`});
          }
          break;
        case 'number':
          if (value < rules.min) {
            errors.push({field, error: `too little, expect ${rules.min}, got ${value}`});
          }
          if (value > rules.max) {
            errors.push({field, error: `too big, expect ${rules.max}, got ${value}`});
          }
          break;
      }
    }

    return errors;
  }
};

