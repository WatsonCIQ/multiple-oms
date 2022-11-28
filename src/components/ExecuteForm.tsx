import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getRandomIntInclusive } from "../utils";
import moment from "moment";
import { Order } from "../types/orders";

const SignUpSchema = Yup.object().shape({
  broker: Yup.string().required("Required"),
  // executedQuantity: Yup.number().max(),
  executedPrice: Yup.string().required("Required"),
  
});

const initialValues = {
  broker: 'CS',
  executedQuantity: '0',
  executedPrice: '',
  executedQuantityPercent:0
};

interface InputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: any;
  disabled?: boolean;
  style?:any;
  validate?:any;
}

const getExecutedQuantity=(targetQuantity:number,executedQuantity:number,executedQuantityPercent:number )=>{
  let placeQuantity=  (((targetQuantity-executedQuantity)*executedQuantityPercent)/100)+executedQuantity;
  return Math.floor(placeQuantity);
}

const TextInputField = ({
  name,
  label,
  placeholder,
  type,
  disabled = false,
  style,
  validate
}: InputProps) => (
  <div>
    {label && <label htmlFor={name}>{label}</label>}
    <Field
      name={name}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      style={style}
      validate={validate}
    />
    <ErrorMessage name={name} component="span" />
  </div>
);

interface ISelectField extends InputProps {
  options: { label: string; value: string | number }[];
}

const validateExecuteQuantity=(value:number, maxQuantity:number)=>{
  let error;
  if (value > maxQuantity) {
    error = `Max Exec Quantity is ${maxQuantity}`;
  }
  return error;
}
// Renders an HTML <select>
const SelectField = ({
  name,
  label,
  placeholder,
  type,
  disabled = false,
  options = [],
}: ISelectField) => (
  <div>
    {label && <label htmlFor={name}>{label}</label>}
    <Field name={name} disabled={disabled} as="select" defaultValue={placeholder}>
      {options.length &&
        options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
        
    </Field>
    <ErrorMessage name={name} component="span" />
  </div>
);

const CloseButton = ({ hideForm }: { hideForm: () => void }) => (
  <button onClick={hideForm} style={{display: "inline-block",marginRight:'50px'}} >Cancel</button>
);

/**
 * Main Order Form
 * @param param0
 * @returns
 */
export function ExecuteForm({
  appName,
  updateAndSend,
  selectedOrders,
  deleteSelectedOrders,
  hideForm,
}: {
  appName: string;
  updateAndSend: Function;
  selectedOrders:Order[];
  deleteSelectedOrders:Function;
  hideForm: () => void;
}) {
  return (
    <div style={{}}>
      <Formik
        initialValues={initialValues}
        validationSchema={SignUpSchema}
        onSubmit={(values, actions) => {
          
        
          const orders= selectedOrders.map(order => {
            return selectedOrders.length===1 ? {
              ...order,...values,status: Number(order.executedQuantity)+Number(values.executedQuantity)===order.targetQuantity?'WAITING FOR ACK':'EXECUTING',executedQuantity:Number(order.executedQuantity)+Number(values.executedQuantity)
            }:{
              ...order,status: (((Number(order.targetQuantity)-Number(order.executedQuantity))*Number(values.executedQuantityPercent))/100)+Number(order.executedQuantity)===Number(order.targetQuantity)? 'WAITING FOR ACK' :'EXECUTING',broker:values.broker, 
              executedQuantity: getExecutedQuantity(Number(order.targetQuantity), Number(order.executedQuantity), Number(values.executedQuantityPercent))
              ,executedPrice:values.executedPrice
            }
          })         
          orders.forEach(order => {
            updateAndSend(order);
            console.log(order);
          })
          // add the order to state
          

          actions.setSubmitting(false);
          deleteSelectedOrders();
          // actions.resetForm({
          //   values: {
          //     ...initialValues,
          //     orderId: Math.floor(100000 + Math.random() * 900000),
          //   },
          //   // you can also set the other form states here
          // });

          hideForm();
        }}
      >
        <Form>
          <SelectField
            name="broker"
            label="Broker"
            options={[
              { value: "CS", label: "CS" },
              { value: "JPM", label: "JPM" },
              { value: "CITI", label: "CITI" },
              { value: "MS", label: "MS" },
              { value: "BARC", label: "BARC" },
            ]}
          />
          { selectedOrders.length===1 && <TextInputField style={{backgroundColor:'#463030'}}
            name="availableQuantity"
            label="Available Quantity"
            placeholder={(selectedOrders[0].targetQuantity-selectedOrders[0].executedQuantity).toString()}
            type="number"
            disabled={true}
          ></TextInputField>}
         { selectedOrders.length===1 && <TextInputField
            name="executedQuantity"
            label="Exec Quantity"
            type="number"
            validate={(val:number)=>validateExecuteQuantity(val,(selectedOrders[0].targetQuantity-selectedOrders[0].executedQuantity))}
          ></TextInputField>}
          {
            selectedOrders.length>1 && 
            <TextInputField
            name="executedQuantityPercent"
            label="Exec Quantity(%)"
            type="number"
          ></TextInputField>
          }
          <TextInputField
            name="executedPrice"
            label="Exec Price"
            type="string"
          ></TextInputField> 
          <div> 
            <button type="submit" style={{display: "inline-block", marginRight:'20px'}}>Submit</button>
            <CloseButton hideForm={hideForm} />
            </div>
         
          
        </Form>
      </Formik>
    </div>
  );
}