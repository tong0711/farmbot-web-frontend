import "./css/_index.scss";
import * as React from "react";
import { Provider } from "react-redux";
import { Router, RedirectFunction, RouterState } from "react-router";
import App from "./app";
import { store } from "./redux/store";
import { history } from "./history";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { isMobile } from "./util";

interface RootComponentProps {
  store: Store;
}

declare const System: any;

function errorLoading(err: any) {
  console.error("Dynamic page loading failed", err);
}

export class RootComponent extends React.Component<RootComponentProps, {}> {

  requireAuth(_: RouterState, replace: RedirectFunction) {
    let { store } = this.props;
    if (Session.get()) { // has a previous session in cache
      if (store.getState().auth) { // Has session, logged in.
        return;
      } else { // Has session but not logged in (returning visitor).
        store.dispatch(ready());
      };
    } else { // Not logged in yet.
      Session.clear(true);
    }
  };

  /** These methods are a way to determine how to load certain modules
   * based on the device (mobile or desktop) for optimization/css purposes.
   * Open to revision.
   */
  replaceDesignerModules(next: RouterState, replace: RedirectFunction) {
    if (next.location.pathname === "/app/designer" && !isMobile()) {
      replace(`${next.location.pathname}/plants`);
    }
  };

  replaceSequencesModules(next: RouterState, replace: RedirectFunction) {
    if (next.location.pathname === "/app/sequences" && isMobile()) {
      replace(`${next.location.pathname}/`);
    }
  };

  /*
    /app                => App
    /app/account        => Account
    /app/controls       => Controls
    /app/device         => Devices
    /app/designer?p1&p2 => FarmDesigner
    /app/regimens       => Regimens
    /app/sequences      => Sequences
    /app/tools          => Tools
    /app/404            => 404
  */

  routes = {
    component: App,
    indexRoute: {
      path: "app/controls",
      getComponent(location: any, cb: any) {
        System.import("./controls/controls.tsx").then(
          (module: any) => cb(null, module.Controls)
        ).catch(errorLoading);
      }
    },
    childRoutes: [
      {
        path: "app/account",
        getComponent(location: any, cb: any) {
          System.import("./account/index.tsx").then(
            (module: any) => cb(null, module.Account)
          ).catch(errorLoading);
        }
      },
      {
        path: "app/controls",
        getComponent(location: any, cb: any) {
          System.import("./controls/controls.tsx").then(
            (module: any) => cb(null, module.Controls)
          ).catch(errorLoading);
        }
      },
      {
        path: "app/device",
        getComponent(location: any, cb: any) {
          System.import("./devices/devices.tsx").then(
            (module: any) => cb(null, module.Devices)
          ).catch(errorLoading);
        }
      },
      {
        path: "app/designer",
        onEnter: this.replaceDesignerModules.bind(this),
        getComponent(location: any, cb: any) {
          System.import("./farm_designer/index.tsx").then(
            (module: any) => cb(null, module.FarmDesigner)
          ).catch(errorLoading);
        },
        childRoutes: [
          {
            path: "plants",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/plant_inventory.tsx").then(
                (module: any) => cb(null, module.Plants)
              ).catch(errorLoading);
            },
          },
          {
            path: "plants/crop_search",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/species_catalog.tsx").then(
                (module: any) => cb(null, module.SpeciesCatalog)
              ).catch(errorLoading);
            },
          },
          {
            path: "plants/crop_search/:species",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/species_info.tsx").then(
                (module: any) => cb(null, module.SpeciesInfo)
              ).catch(errorLoading);
            },
          },
          {
            path: "plants/crop_search/:species/add",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/dnd_species_mobile.tsx").then(
                (module: any) => cb(null, module.DNDSpeciesMobile)
              ).catch(errorLoading);
            },
          },
          {
            path: "plants/:plant_id",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/plant_info.tsx").then(
                (module: any) => cb(null, module.PlantInfo)
              ).catch(errorLoading);
            },
          },
          {
            path: "plants/:plant_id/edit",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/edit_plant_info.tsx").then(
                (module: any) => cb(null, module.EditPlantInfo)
              ).catch(errorLoading);
            },
          },
          {
            path: "farm_events",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/farm_events.tsx").then(
                (module: any) => cb(null, module.FarmEvents)
              ).catch(errorLoading);
            }
          },
          {
            path: "farm_events/add",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/add_farm_event.tsx").then(
                (module: any) => cb(null, module.AddFarmEvent)
              ).catch(errorLoading);
            }
          },
          {
            path: "farm_events/:farm_event_id",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/edit_farm_event.tsx").then(
                (module: any) => cb(null, module.EditFarmEvent)
              ).catch(errorLoading);
            }
          }
        ]
      },
      {
        path: "app/regimens",
        getComponent(location: any, cb: any) {
          System.import("./regimens/index.tsx").then(
            (module: any) => cb(null, module.Regimens)
          ).catch(errorLoading);
        }
      },
      {
        path: "app/sequences",
        getComponent(location: any, cb: any) {
          if (!isMobile()) {
            System.import("./sequences/sequences.tsx").then(
              (module: any) => cb(null, module.Sequences)
            ).catch(errorLoading);
          } else {
            System.import("./sequences/sequences_list.tsx").then(
              (module: any) => cb(null, module.SequencesList)
            ).catch(errorLoading);
          }
        },
      },
      {
        path: "app/sequences/:sequence",
        getComponent(location: any, cb: any) {
          System.import("./sequences/sequences.tsx").then(
            (module: any) => cb(null, module.Sequences)
          ).catch(errorLoading);
        },
      },
      {
        path: "app/tools",
        getComponent(location: any, cb: any) {
          System.import("./tools/index.tsx").then(
            (module: any) => cb(null, module.Tools)
          ).catch(errorLoading);
        }
      },
      {
        path: "app/404",
        getComponent(location: any, cb: any) {
          System.import("./404").then(
            (module: any) => cb(null, module.FourOhFour)
          ).catch(errorLoading);
        }
      }
    ]
  };

  render() {
    return <Provider store={store}>
      <Router history={history}>
        {this.routes}
      </Router>
    </Provider>;
  }
}
