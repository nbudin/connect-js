import { IStripeConnectInitParams, StripeConnectInstance, ConnectElementTagName } from "../types";
export type LoadConnectAndInitialize = (initParams: IStripeConnectInitParams) => StripeConnectInstance;
export type ConnectElementHTMLName = "stripe-connect-payments" | "stripe-connect-payouts" | "stripe-connect-payment-details" | "stripe-connect-account-onboarding" | "stripe-connect-payment-method-settings" | "stripe-connect-account-management" | "stripe-connect-notification-banner" | "stripe-connect-instant-payouts" | "stripe-connect-issuing-card" | "stripe-connect-issuing-cards-list";
export declare const componentNameMapping: Record<ConnectElementTagName, ConnectElementHTMLName>;
type StripeConnectInstanceExtended = StripeConnectInstance & {
    debugInstance: () => Promise<StripeConnectInstance>;
};
interface StripeConnectWrapper {
    initialize: (params: IStripeConnectInitParams) => StripeConnectInstance;
}
export declare const findScript: () => HTMLScriptElement | null;
export declare const loadScript: () => Promise<StripeConnectWrapper>;
export declare const initStripeConnect: (stripePromise: Promise<StripeConnectWrapper>, initParams: IStripeConnectInitParams) => StripeConnectInstanceExtended;
export {};
