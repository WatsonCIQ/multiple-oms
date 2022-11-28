import { ReactNode, useState } from "react";
import "../styles.css";
import { Order } from "../types/orders";
import 'react-statusbar/dist/statusbar.css';
import * as Statusbar from 'react-statusbar';

/**
 * Full execution:
 * On the combined blotter :
 * - execute button
 *  - toggle to execute multiple
 *  - the OMS it came from executes and the same time as the combine blotter
 * - when done can click a done button and will remove the order from the combined blotter but not the other OMS
 */
interface Props {
  appName: string;
  checkboxAction?: Function;
  children?: ReactNode;
  menu?: ({ order, updateOrder }: { order: Order,updateOrder?:Function }) => ReactNode;
  orders: Array<Order>;
  rowCheckbox?: boolean;
  rowClickAction?: Function;
  selectedOrders?: Order[];
  action?:Function;
}

export default function Blotter(props: Props) {
  const {
    appName,
    checkboxAction,
    menu,
    orders,
    rowCheckbox = false,
    rowClickAction,
    selectedOrders,
    action
  } = props;

  const [currentOrder, setCurrentOrder] = useState<Order>();

  const getName=(name:string)=>{
    const nameArray= name.split(' ');
    return nameArray[0].charAt(0) +nameArray[1];
  }

  return (
    <div>
      {menu && currentOrder && menu({ order: { ...currentOrder, appName }, updateOrder:action })}
      {props.children}
      <table>
        <thead>
          <tr>
            {rowCheckbox && <th></th>}
            <th>Order ID</th>
            <th>Ticker</th>
            <th>Security ID</th>
            <th>Tgt Price</th>
            <th>Tgt Quantity</th>
            {/* target price * target Quantity */}
            <th>Tgt Amount</th>
            <th>Account</th>
            <th>Manager</th>
            <th>Trader</th>
            <th style={{minWidth:'75px'}}>Trade Date</th>
            {/* make settlement date 2 days later */}
            <th style={{minWidth:'75px'}}>Settlement Date</th>
            <th>Status</th>
            <th>Exec Qty</th>
            <th>Exec Price</th>
            <th>Exec Status</th>
            <th>Broker</th>
            <th>Security Type</th>
            <th>Side</th>
            {appName==='combined' && <th style={{minWidth:'75px'}}>System</th>}
            <th>Duration</th>
            <th>Instruction</th>
            <th>Limit</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((item) => (
            <tr
              key={item.orderId}
              onClick={() => {
                // only do the action when there is a rowClickAction
                rowClickAction && rowClickAction(item);
                // add a FDC3Broadcast here
              }}
              onContextMenu={() => {
                //only send the order if there is a context menu (contextMenu is a right click)
                menu && setCurrentOrder(item);
              }}
              style={{
                backgroundColor:
                  selectedOrders?.find(
                    ({ orderId }) => orderId === item.orderId
                  ) && "#b7b7b7",
              }}
            >
              {rowCheckbox && (
                <td>
                  <input
                    type="checkbox"
                    name="selectRow"
                    onChange={() => checkboxAction && checkboxAction(item)}
                    disabled={item.status==='READY' || (item.status==='EXECUTING' && item.executedQuantity===item.targetQuantity) ||item.status==='WAITING FOR ACK' ||item.status==='ACCT'}
                    checked={selectedOrders?.some((x)=>x.orderId===item.orderId)}
                  ></input>
                </td>
              )}
              <td>{item.orderId}</td>
              <td>{item.ticker}</td>
              <td>{item.securityId}</td>
              <td className="target-price">{item.targetPrice}</td>
              <td>{item.targetQuantity}</td>
              <td>{item.targetAmount}</td>
              <td>{item.account}</td>
              <td>{getName(item.manager)}</td>
              <td>{getName(item.trader)}</td>
              <td>{item.tradeDate}</td>
              <td>{item.settlementDate}</td>
              <td className={(item.status==='EXECUTING' || item.status==='WAITING FOR ACK')?'td-executing':'td-normal'}>
                {item.status}
              </td>
              <td>{item.executedQuantity}</td>
              <td>{item.executedPrice}</td>
              <td><Statusbar.Progress value={item.executedQuantity} max={item.targetQuantity} className="statusBar" />
                </td>
              <td>{item.status==='OPEN'?'':item.broker}</td>
              <td>{item.securityType}</td>
              <td
                style={{
                  color:
                    item.transactionType === "SELLL"
                      ? "var(--CLOSED)"
                      : "var(--OPEN)",
                      
                }}
              >
                {item.transactionType}
              </td>
              {appName==='combined' && <td>{item.appName}</td>}
              <td>{item.duration}</td>
              <td>{item.instruction}</td>
              <td>{item.limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  
}
