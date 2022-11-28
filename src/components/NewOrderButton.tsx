import React from "react";
import "../styles.css";
export interface NewOrderButtonProps{ 
  showForm:() => void;
  appCSS: string;
}
export default function NewOrderButton(props: NewOrderButtonProps) {
  return (
    <div>
      <button onClick={props.showForm} className={`${props.appCSS} sell-button`}>Sell</button>
        <button onClick={props.showForm} className={`${props.appCSS} buy-button`}>Buy</button>
         
    </div>
  );

  ;
}
