import { broadcast } from "@finos/fdc3";
import { useCallback, useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { Order } from "../types/orders";

interface Props {
  defaultValue: Order[];
  appName: string;
}

export default function useOrders(props: Props) {
  const { defaultValue, appName } = props;

  const [orders, dispatch] = useImmerReducer((draft, action) => {
    switch (action.type) {
      case "add":
        draft.unshift(action.order);
        break;

      case "fill":
        //From the order get a placement remove it from the placements array and move it to the fills array
        // const orderFillIndex = draft.findIndex(
        //   (order) => order.orderId === action.orderId
        // );

        break;
      default:
        console.warn("no action taken - order reducer");
        break;
    }
  }, defaultValue);

  const addOrder = useCallback(
    (newOrder: Order) => {
      // check to make sure it's not already in the orders before we try and add it
      const index = orders.find((order) => newOrder.orderId === order.orderId);
      if (index) return;

      dispatch({
        type: "add",
        order: newOrder,
      });
    },
    [dispatch, orders]
  );


  /**
   * Notifications:
   * If the draft state is !filled and the new state == filled then send Notification.
   *
   */

  return {
    orders,
    addOrder,
  };
}

export const sendOrderToCombinedApp = (order: Order) =>
  broadcast({
    type: "finsemble.order",
    order: { ...order, destinationApp: "combined" },
  });
