import QUnit from 'steal-qunit';
import observable from './maurauder';

function assertStreamValues(stream, values, key) {
  values.forEach(() => {
    QUnit.stop();
  });

  let count = 0;

  stream.subscribe((val) => {
    QUnit.deepEqual(val, values[count], `${key}[${count}] should be ${values[count]}`);
    count++;
    QUnit.start();
  });
}

QUnit.module('maurauder');

QUnit.test('can create settable streams of primitive values', () => {
  class Person {
    @observable
    first = 'Kevin';
  }

  const person = new Person();
  assertStreamValues(person.first, [ 'Kevin', 'Tracy' ], 'person.first');

  person.first = 'Tracy';
});

QUnit.test('can create streams derived from other streams', () => {
  class Person {
    constructor(override) {
      Object.assign(this, override);
    }

    @observable
    first = 'Kevin';

    @observable
    last = 'Phillips';

    @observable
    fullName() {
      return this.first.combineLatest(this.last, (first, last) => {
        return first + ' ' + last;
      });
    }
  }

  const person = new Person({
    first: 'Kevin'
  });

  person.last = 'McCallister';

  assertStreamValues(person.fullName, [
    'Kevin Phillips',
    'Kevin McCallister'
  ], 'person.fullName');
});

QUnit.test('can create streams derived from their own set values', () => {
  class LastThree {
    @observable
    lastThree(fullNameSetStream) {
      return fullNameSetStream
        .startWith([ 'one', 'two', 'three' ])
        .scan((acc, latest) => acc.slice(1, 3).concat([ latest ]));
    }
  }

  const lt = new LastThree();

  assertStreamValues(lt.lastThree, [
    [ 'one', 'two', 'three' ],
    [ 'two', 'three', 'four' ],
    [ 'three', 'four', 'five' ],
    [ 'four', 'five', 'six' ]
  ], 'lt.lastThree');

  lt.lastThree = 'four';
  lt.lastThree = 'five';
  lt.lastThree = 'six';
});
