import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getRandomIntInclusive } from "../utils";
import moment from "moment";

const SignUpSchema = Yup.object().shape({
  orderId: Yup.string().required("Required"),
  ticker: Yup.string().required("Required"),
  targetPrice: Yup.string().required("Required"),
  targetQuantity: Yup.string().required("Required"),
  manager: Yup.string().required("Required"),
  trader: Yup.string().required("Required"),
  tradeDate: Yup.string().required("Required"),
  account: Yup.string().required("Required"),
  broker: Yup.string().required("Required"),
  securityType: Yup.string().required("Required"),
  transactionType: Yup.string().required("Required"),
});

const initialValues = {
  orderId: Math.floor(100000 + Math.random() * 900000),
  ticker: "AAPL",
  targetPrice: 42,
  targetQuantity: 200,
  manager: "Dave",
  trader: "Dave",
  tradeDate: new Date().toISOString().split("T")[0],
  account: "PF76876",
  broker: "CS",
  securityType: "CB",
  transactionType: "BUYL",
  duration: "D",
  instruction: "MKT",
};

interface InputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: any;
  disabled?: boolean;
}
const TextInputField = ({
  name,
  label,
  placeholder,
  type,
  disabled = false,
}: InputProps) => (
  <div>
    {label && <label htmlFor={name}>{label}</label>}
    <Field
      name={name}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
    />
    <ErrorMessage name={name} component="span" />
  </div>
);

interface ISelectField extends InputProps {
  options: { label: string; value: string | number }[];
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
export function OrderForm({
  appName,
  addOrder,
  hideForm,
}: {
  appName: string;
  addOrder: Function;
  hideForm: () => void;
}) {
  return (
    <div style={{}}>
      <Formik
        initialValues={initialValues}
        validationSchema={SignUpSchema}
        onSubmit={(values, actions) => {
          let tradeDate = moment().format('DD MMM YYYY');
          const settlementDate = moment().add(2,'days').format('DD MMM YYYY');
          const order = {
            ...values,
            securityId: getRandomIntInclusive(1000, 5000),
            orderId: Math.floor(100000 + Math.random() * 900000),
            tradeDate,
            settlementDate,
            targetAmount:
              Number(values.targetPrice) * Number(values.targetQuantity),
            status: "OPEN",
            executedQuantity: 0,
            executedPrice:''
          };

          // add the order to state
          addOrder(order);
          console.log(order);

          actions.setSubmitting(false);
          actions.resetForm({
            values: {
              ...initialValues,
              orderId: Math.floor(100000 + Math.random() * 900000),
            },
            // you can also set the other form states here
          });

          hideForm();
        }}
      >
        <Form>
          
          {/* <TextInputField
            name="orderId"
            label="Order ID"
            disabled={true}
          ></TextInputField> */}
          <TextInputField name="ticker" label="Ticker"></TextInputField>
          <TextInputField
            name="targetPrice"
            label="Target Price"
            type="number"
          ></TextInputField>
          <TextInputField
            name="targetQuantity"
            label="Target Quantity"
            type="number"
          ></TextInputField>
          <SelectField name="manager" label="Manager"
          options={[
            { value: "Rhianna Parmenter", label: "Rhianna Parmenter" },
            { value: "Gert Wheatland", label: "Gert Wheatland" },
            { value: "Corty Jellard", label: "Corty Jellard" },
            { value: "Kathie St. Ledger", label: "Kathie St. Ledger" },
          ]} />
          <SelectField
            name="account"
            label="Account"
            options={[
              { value: "PF76876", label: "PF76876" },
              { value: "PF98765", label: "PF98765" },
              { value: "PF43567", label: "PF43567" },
              { value: "PF98262", label: "PF98262" },
              { value: "PF98383", label: "PF98383" },
              { value: "PF19827", label: "PF19827" },
              { value: "PF43537", label: "PF43537" },
              { value: "PF72763", label: "PF72763" },
              { value: "PF37363", label: "PF37363" },
            ]}
          />
          <SelectField name="trader" label="Trader"
          options={[
            { value: "Rhianna Parmenter", label: "Rhianna Parmenter" },
            { value: "Gert Wheatland", label: "Gert Wheatland" },
            { value: "Corty Jellard", label: "Corty Jellard" },
            { value: "Kathie St. Ledger", label: "Kathie St. Ledger" },
          ]}  />
          <TextInputField
            name="tradeDate"
            label="Trade Date"
            type="date"
          ></TextInputField>
          {/* <SelectField
            name="broker"
            label="Broker"
            options={[
              { value: "CS", label: "CS" },
              { value: "JPM", label: "JPM" },
              { value: "CITI", label: "CITI" },
              { value: "MS", label: "MS" },
              { value: "BARC", label: "BARC" },
            ]}
            
          /> */}
          <SelectField
            name="securityType"
            label="Security Type"
            options={[
              { value: "CB", label: "CB" },
              { value: "GB", label: "GB" },
              { value: "COM", label: "COM" },
              { value: "PFD", label: "PFD" },
            ]}
          />
          <SelectField
            name="transactionType"
            label="Transaction Type"
            options={[
              { value: "BUYL", label: "BUYL" },
              { value: "SELL", label: "SELLL" },
            ]}
          />
          <SelectField
            name="duration"
            label="duration"
            options={[
              { value: "D", label: "D" },
              { value: "GTC", label: "GTC" },
              { value: "GTD", label: "GTD" },
              { value: "FOK", label: "FOK" },
            ]}
          />
          <SelectField
            name="instruction"
            label="instruction"
            options={[
              { value: "MKT", label: "MKT" },
              { value: "LIM", label: "LIM" },
              { value: "MO", label: "MO" },
            ]}
          />
          <div> 
            <button type="submit" style={{display: "inline-block", marginRight:'20px'}}>Submit</button>
            <CloseButton hideForm={hideForm} />
            </div>
         
          
        </Form>
      </Formik>
    </div>
  );
}