import React, { PureComponent, Children } from "react";

function createSiloProvider(store, Provider) {
  return class SiloProvider extends PureComponent {
    constructor(props) {
      super(props);

      this.state = { store, state: store.getState() };
    }
    componentDidMount() {
      store.subscribe(() => this.setState({ state: store.getState() }));
    }
    render() {
      return (
        <Provider value={this.state}>
          {Children.only(this.props.children)}
        </Provider>
      );
    }
  };
}

function createSiloConnector(Consumer) {
  return (reducerMap, mapStateToProps, mapDispatchToProps) => (Component) => {
    const componentName = Component.displayName || Component.name || null;
    const connectedName = componentName
      ? `SiloConnector<${componentName}>`
      : "SiloConnector";

    return class extends PureComponent {
      static displayName = connectedName;

      render() {
        return (
          <Consumer>
            {({ state, store }) => {
              const props = this.props;
              const passedState = reduceObject(
                reducerMap,
                (passedState, v, k) => {
                  return {
                    ...passedState,
                    [k]: state.getIn(store.getReducerPath(v)),
                  };
                },
                {},
              );
              const mappedState = mapStateToProps(passedState, props);

              return <Component {...props} {...mappedState} />;
            }}
          </Consumer>
        );
      }
    };
  };
}

export function createSiloConnector(store) {
  const { Provider, Consumer } = React.createContext();

  return {
    Provider: createSiloProvider(Provider),
    connect: createSiloConnector(Consumer),
  };
}
