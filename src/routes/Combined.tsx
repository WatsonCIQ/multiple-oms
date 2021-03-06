import { addContextListener } from "@finos/fdc3";
import * as FSBL from "@finsemble/finsemble-core";
import { useCallback, useEffect } from "react";
import { useImmer } from "use-immer";
import Blotter from "../components/Blotter";
import useOrders from "../hooks/useOrders";
import { Order, OrderContext } from "../types/orders";

export default function Combined() {
  const appName = "combined";

  const { orders, addOrder, updateFill, deleteOrder } = useOrders({
    defaultValue: [],
    appName,
  });

  const [selectedOrders, setSelectedOrders] = useImmer<Order[]>([]);

  useEffect(() => {
    const listener = addContextListener(
      "finsemble.order",
      (context: OrderContext) => {
        if (!context.order) return;
        if (context?.order?.destinationApp !== "combined") return;

        console.log(context.order);
        context.order.status = "NEW";
        addOrder(context.order);

        // send a notification
        if (window.FSBL) {
          FSBL.Clients.NotificationClient.notify({
            // id: "adf-3484-38729zg", // distinguishes individual notifications - provided by Finsemble if not supplied
            // issuedAt: "2021-12-25T00:00:00.001Z", // The notifications was sent - provided by Finsemble if not supplied
            // type: "configDefinedType", // Types defined in the config will have those values set as default
            source: "Finsemble", // Where the Notification was sent from
            title: `New Order from ${context.order.appName}`,
            details: `${context.order.ticker} at ${context.order.targetAmount}`,
            // headerLogo: "URL to Icon",
            // actions: [], // Note this has no Actions making it Informational
            // meta: {} // Use the meta object to send any extra data needed in the notification payload
          });
        }
      }
    );
    return () => {
      listener.unsubscribe();
    };
  }, [addOrder, appName]);

  const addSelectedOrder = useCallback(
    (order: Order) => {
      setSelectedOrders((draft) => {
        const index = draft.findIndex((o) => o && o.orderId === order.orderId);
        // we want to have the ability to select and deselect items from the blotter. If the item exists we remove it and if not we add it.

        if (index !== -1) {
          draft.splice(index, 1);
        } else {
          draft.push(order);
        }
      });
    },
    [setSelectedOrders]
  );

  const deleteSelectedOrders = useCallback(() => {
    setSelectedOrders((draft) => {
      return [];
    });
  }, [setSelectedOrders]);

  const ExecuteButton = () => (
    <button
      onClick={() => {
        selectedOrders.forEach((order) => updateFill(order));
      }}
    >
      execute orders
    </button>
  );

  const RemoveOrderButton = () => (
    <button
      onClick={() => {
        selectedOrders.forEach((order) => deleteOrder(order));
        deleteSelectedOrders();
      }}
    >
      remove orders
    </button>
  );

  return (
    <div className={`combined App`}>
      <header className="App-header">Combined Blotter</header>
      {selectedOrders.length > 0 ? (
        <>
          <ExecuteButton />
          <RemoveOrderButton />
        </>
      ) : (
        <></>
      )}

      <Blotter
        appName={appName}
        orders={orders as Order[]}
        selectedOrders={selectedOrders}
        rowCheckbox={true}
        checkboxAction={addSelectedOrder}
      />
    </div>
  );
}
