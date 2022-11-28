import { broadcast, getOrCreateChannel } from "@finos/fdc3";
import { useCallback, useEffect } from "react";
import { useImmerReducer } from "use-immer";
import { Order, OrderContext } from "../types/orders";

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
      case "delete":
        draft.splice(action.orderIndex, 1);
        break;
      case "update":
        const index = draft.findIndex(
          (order) => order.orderId === action.order.orderId
        );
        if (index !== -1) draft[index] = action.order;
        break;
      case "updateCombined":
          const combined_index = draft.findIndex(
            (order) => order.orderId === action.order.orderId
          );
          if (combined_index !== -1) draft[combined_index] = action.order;
          break;
      case "fill":
        //From the order get a placement remove it from the placements array and move it to the fills array
        const orderFillIndex = draft.findIndex(
          (order) => order.orderId === action.orderId
        );

        if (action.executedQuantity) {
          draft[orderFillIndex].executedQuantity = action.executedQuantity;
          draft[orderFillIndex].executedPrice = action.executedPrice;
        }
        if (action.status) {
          draft[orderFillIndex].status = action.status;
          draft[orderFillIndex].executedPrice = action.executedPrice;
        }

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

  const updateOrder = useCallback(
    (updatedOrder: Order) => {
      dispatch({
        type: "update",
        order: updatedOrder,
      });

      
    },
    [dispatch]
  );

  const updateAndSend = useCallback(
    (updatedCombinedOrder: Order) => {
      dispatch({
        type: "updateCombined",
        order: updatedCombinedOrder,
      });
      //once this is done, broadcast it back.
      broadcast({
        type: "finsemble.order",
         //@ts-ignore
        order: { ...updatedCombinedOrder, destinationApp:updatedCombinedOrder.appName },
      });
    },
    [dispatch]
  );

  const deleteOrder = useCallback(
    (order: Order) => {
      const orderIndex = orders.findIndex((o) => o.orderId === order.orderId);
      dispatch({
        type: "delete",
        orderIndex,
      });
    },
    [dispatch, orders]
  );

  const updateFill = useCallback(
    (order: Order) => {
      const { targetQuantity, status } = order;

      const xPercent = Number(targetQuantity) * 0.25;

      // broadcast({
      //   type: "finsemble.order",
      //   order:order
        
      // });

      const fillOrder = (amount: number) => {
        let fillAmount = amount + xPercent;

        if (fillAmount > targetQuantity || status === "READY") {
          dispatch({
            type: "fill",
            orderId: order.orderId,
            status: "READY",
            executedPrice:order.executedPrice
          });
         
          broadcast({
            type: "finsemble.order",
             //@ts-ignore
            order: { ...order, status:'READY', destinationApp:'combined' },
          });
          return;
        }

        setTimeout(() => {
          dispatch({
            type: "fill",
            orderId: order.orderId,
            executedQuantity: Math.round(fillAmount),
            status: "WORK",
            executedPrice:order.executedPrice
          });
          fillOrder(fillAmount);
        }, 2000);
      };

      fillOrder(0);
    },
    [dispatch]
  );

  /**
   * Notifications:
   * If the draft state is !filled and the new state == filled then send Notification.
   *
   */
  // useEffect(() => {
  //   const setUpChannelListener = async () => {
  //     const channel = await getOrCreateChannel("orders");
  //     const listener = channel.addContextListener(
  //       "finsemble.order",
  //       (context: OrderContext) => {
  //         // only add orders if they come from a different app or if they come from the Combined blotter
  //         if (!context.order || context?.order?.appName !== "combined") return;

  //         addOrder(context.order);
  //       }
  //     );
  //     return listener;
  //   };

  //   const channelListener = setUpChannelListener();
  //   return () => {
  //     channelListener.then((listener) => listener.unsubscribe());
  //   };
  // }, [addOrder]);

  return {
    orders,
    addOrder,
    updateFill,
    deleteOrder,
    updateOrder,
    updateAndSend
  };
}

export const sendOrderToCombinedApp = (order: Order) => 
  broadcast({
    type: "finsemble.order",
    //@ts-ignore
    order: { ...order, destinationApp: "combined" },
  });

  export const sendAccountingStatusToCombinedApp = (order: Order,updateOrder?:Function) => 
  { 
    updateOrder && updateOrder({...order,status: 'ACCT'});
    broadcast({
      type: "finsemble.order",
      //@ts-ignore
      order: { ...order, destinationApp: "combined", status:'ACCT' },
    });
  }
  
