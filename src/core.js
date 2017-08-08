export default function MakeMaurauder(Observable) {
  return function observableDecorator(target, key, descriptor) {
    const startWith = [];
    let observer = null;
    const observable = Observable.create((obs) => observer = obs);

    // props like `first = 'Kevin'` provide an initializer function
    // to return the value;
    if (typeof descriptor.initializer === 'function') {
      startWith.push( descriptor.initializer() );
    }

    return {
      get() {
        if (typeof descriptor.value === 'function') {
          // create derived stream property using function
          //
          // @observable
          // myProp() { ... }
          return descriptor.value.call(target, observable);
        } else {
          // create "simple" stream property
          //
          // @obserable
          // first = 'Kevin';
          return observable
            .startWith(...startWith);
        }
      },

      set(val) {
        if (observer) {
          observer.next(val);
        } else {
          startWith.push(val);
        }
      }
    };
  };
}
