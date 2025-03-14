import React, { useState, useEffect } from "react";
import {
	PayPalScriptProvider,
	usePayPalScriptReducer,
	PayPalButtons,
} from "@paypal/react-paypal-js";
import { useHistory } from "react-router-dom";
import "./paypalDonate.scss";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";


const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const planIds = [
	{
		amount: 10,
		planId: "P-4Y256783L52659318MS5NBKY",
	},
	{
		amount: 25,
		planId: "P-2L2687870R001935CMTPKE4Q",
	},
	{
		amount: 100,
		planId: "P-8VD11280BA252920MMTPKFTI",
	},
];

const oneTimeStyle = { layout: "vertical", color: "black", label: "paypal" };
const recurringStyle = {
	layout: "vertical",
	color: "black",
	label: "subscribe",
};

const ButtonWrapper = ({ intent, showSpinner, formData }) => {
	const history = useHistory();
	const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
	const [planId, setPlanId] = useState("P-4Y256783L52659318MS5NBKY");

	useEffect(() => {
		dispatch({
			type: "resetOptions",
			value: {
				...options,
				currency: formData.currency,
				intent: intent,
			},
		});
	}, [intent, showSpinner, formData.currency]);

	useEffect(() => {
		const plan = planIds.find((e) => e.amount === formData.amount);
		setPlanId(plan !== undefined ? plan.planId : "");
	}, [formData]);

	return (
		<>
			{showSpinner && isPending && (
				<LoadingSpinner showLoadingSpinner={true} />
			)}
			<PayPalButtons
				style={intent === "capture" ? oneTimeStyle : recurringStyle}
				disabled={false}
				forceReRender={[
					intent,
					formData.amount,
					formData.currency,
					oneTimeStyle,
				]}
				fundingSource={undefined}
				createOrder={
					intent === "capture"
						? (data, actions) => {
								return actions.order
									.create({
										purchase_units: [
											{
												amount: {
													currency_code:
														formData.currency,
													value: formData.amount,
												},
											},
										],
									})
									.then((orderId) => {
										return orderId;
									});
						  }
						: undefined
				}
				createSubscription={
					intent === "subscription"
						? (data, actions) => {
								return actions.subscription
									.create({
										plan_id:
											planId !== undefined ? planId : "",
									})
									.then((orderId) => {
										return orderId;
									});
						  }
						: undefined
				}
				onApprove={function (data, actions) {
					history.push("donate/success", intent);
				}}
				onError={function (err) {
					window.location.href = "/donate/error";
				}}
			/>
		</>
	);
};

/**
 *
 * @param {currency} string
 * @param {amount} string
 * @param {planId} string
 * @returns {JSX.Element}
 * @constructor
 */
export default function PaypalDonate({ donationType, showForm, formData }) {
	return (
		<div className="paypal-buttons-wrap">
			{/*Need to leave forms this way as options is hardcoded in PayPalScriptProvider*/}
			{showForm && donationType === "One Time Donation" && (
				<PayPalScriptProvider
					options={{
						clientId: clientId,
						components: "buttons",
						currency: formData.currency,
					}}
				>
					<ButtonWrapper
						intent={"capture"}
						showSpinner={true}
						formData={formData}
					/>
				</PayPalScriptProvider>
			)}
			{showForm && donationType === "Recurring Donation" && (
				<PayPalScriptProvider
					options={{
						clientId: clientId,
						components: "buttons",
						currency: formData.currency,
						vault: true,
					}}
				>
					<ButtonWrapper
						intent={"subscription"}
						showSpinner={true}
						formData={formData}
					/>
				</PayPalScriptProvider>
			)}
		</div>
	);
}
