import { Map, fromJS } from "immutable";
import { createStore } from "redux";
import { compileReducerTree, silo } from "../src/enhancer";

test("compileReducerTree.reducerByName matches snapshot.", () => {
  const reducerTree = {
    test1: () => {},
    test2: {
      test3: () => {},
    },
    test4: {
      test5: () => {},
      test6: () => {},
      test7: {
        test8: () => {},
        test9: {
          test10: () => {},
        },
      },
    },
  };
  const compiledReducerTree = compileReducerTree(reducerTree);
  expect(compiledReducerTree.reducerByName).toMatchSnapshot();
});

// TODO: Just test the reducer function and not createStore().
test("compileReducerTree.reducer calls all reducers and updates state properly.", () => {
  const store = createStore(
    {
      test1: (state = true, action) =>
        action.type === "FLIP" ? !state : state,
      test2: {
        test3: (state = 0, action) => {
          if (action.type === "INCREMENT") {
            return state + 1;
          } else if (action.type === "FLIP") {
            return -state;
          }
          return state;
        },
      },
    },
    silo,
  );

  expect(store.getState()).toEqual(
    fromJS({ test1: true, test2: { test3: 0 } }),
  );
  store.dispatch({ type: "INCREMENT" });
  expect(store.getState()).toEqual(
    fromJS({ test1: true, test2: { test3: 1 } }),
  );
  store.dispatch({ type: "FLIP" });
  expect(store.getState()).toEqual(
    fromJS({ test1: false, test2: { test3: -1 } }),
  );
});
