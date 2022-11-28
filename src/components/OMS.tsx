import { addContextListener, broadcast } from "@finos/fdc3";
import { useEffect, useState } from "react";
import Blotter from "../components/Blotter";
import ContextMenu from "../components/ContextMenu";
import Menu from "../components/Menu";
import NewOrderButton from "../components/NewOrderButton";
import { OrderForm } from "../components/OrderForm";
import useOrders from "../hooks/useOrders";
import {data} from "../mock-data/data2";
import { Order, OrderContext } from "../types/orders";
import { shuffle } from "../utils";

interface Props {
  appCSS: string;
  appName: string;
  title: string;
}
interface NewOrderProps{
  appCSS: string;
}
export default function OMS(props: Props) {
  const { appName, appCSS, title } = props;
  // Holds all the state and logic for the orders
  const { orders, addOrder, updateOrder,updateFill } = useOrders({
    defaultValue: shuffle(data) as Order[],
    appName,
  });

  const [orderFormIsVisible, setOrderFormIsVisible] = useState(false);

  // display either the order button or the order form
  const NewOrder = (props:NewOrderProps) =>{

  
     return (
        <div>
          <NewOrderButton showForm={() => setOrderFormIsVisible(true)} appCSS={appCSS} />
            
           {orderFormIsVisible && <OrderForm
              addOrder={addOrder}
              appName={appName}
              hideForm={() => setOrderFormIsVisible(false)}
            />}
        </div>
     );
  }

  const Title = () => <header className="App-header">{title}</header>;

  const SendOrderMenu = (props: JSX.IntrinsicAttributes & { order: Order, updateOrder?:Function }) => (
    <ContextMenu>
      <Menu {...props} />
    </ContextMenu>
  );

  useEffect(() => {
    if(!window.FSBL) return;
    
    const listener = addContextListener(
      "finsemble.order",
      (context: OrderContext) => {
        if (!context.order) return;
        if (context?.order?.destinationApp !== appName) return;

        console.log(context.order);
        context.order.status = "WORK";
        context.order.targetQuantity===context.order.executedQuantity ?
          updateFill(context.order)
        : updateOrder(context.order)

      }
    );
    return () => {
      listener.unsubscribe();
    };
  },[window.FSBL]);

  const broadcastTicker = (order: Order) => {
    broadcast({
      type: "fdc3.instrument",
      id: {
        ticker: order.ticker,
      },
    });
  };

  return (
    <div>
      <div className={`${appCSS} App-header`}>
        <NewOrder appCSS={appCSS} />
        {appName==='BBAIM' ? 
        <div style={{float:'left', display: 'inline-block'}}><img src='Bloomberg.png' height='25px'  /></div>
        :
        (appName==='CRD'?<div style={{float:'left', display: 'inline-block'}}><img src='CRD2.png' height='25px'></img></div>
        :<div style={{float:'left', display: 'inline-block'}}><img src='Murex.png' height='25px'></img></div> )
        }
      </div>
      <div className={`${appCSS} App`}>
      {/* <Title /> */}
      {/* <NewOrder /> */}
      <Blotter
        appName={appName}
        orders={orders as Order[]}
        menu={SendOrderMenu}
        rowClickAction={broadcastTicker}
        action={updateOrder}
      ></Blotter>
    </div>
    </div>
    
  );
}
