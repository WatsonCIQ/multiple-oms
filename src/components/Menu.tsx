import { sendAccountingStatusToCombinedApp, sendOrderToCombinedApp } from "../hooks/useOrders";
import { Order } from "../types/orders";

export default function Menu({ order, updateOrder }: { order: Order, updateOrder?:Function }) {
  return (
    <div>
      { (order.status!=='READY') && <div id="menu">
      <ul>
        <li
          onClick={() => {
            order && sendOrderToCombinedApp(order);
          }}
        >Send To Combined Blotter
        </li>
        
      </ul>
      </div>}
      { (order.status==='READY') && <div id="menu">
      <ul>
        <li
          onClick={() => {
            order && sendAccountingStatusToCombinedApp(order, updateOrder);
          }}
        >Send To Accounting
        </li>
        
      </ul>
      </div>}
    </div>
    
  );
}
