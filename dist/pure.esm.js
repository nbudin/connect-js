/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
const ConnectElementCustomMethodConfig = {
  "payment-details": {
    setPayment: _payment => {},
    setOnClose: _listener => {}
  },
  "account-onboarding": {
    setFullTermsOfServiceUrl: _termOfServiceUrl => {},
    setRecipientTermsOfServiceUrl: _recipientTermsOfServiceUrl => {},
    setPrivacyPolicyUrl: _privacyPolicyUrl => {},
    setSkipTermsOfServiceCollection: _skipTermsOfServiceCollection => {},
    setOnExit: _listener => {}
  },
  "issuing-card": {
    setDefaultCard: _defaultCard => {},
    setCardArtFileLink: _cardArtFileLink => {},
    setCardSwitching: _cardSwitching => {}
  },
  "issuing-cards-list": {
    setCardArtFileLink: _cardArtFileLink => {}
  }
};

const componentNameMapping = {
  payments: "stripe-connect-payments",
  payouts: "stripe-connect-payouts",
  "payment-details": "stripe-connect-payment-details",
  "account-onboarding": "stripe-connect-account-onboarding",
  "payment-method-settings": "stripe-connect-payment-method-settings",
  "account-management": "stripe-connect-account-management",
  "notification-banner": "stripe-connect-notification-banner",
  "instant-payouts": "stripe-connect-instant-payouts",
  "issuing-card": "stripe-connect-issuing-card",
  "issuing-cards-list": "stripe-connect-issuing-cards-list"
};
const EXISTING_SCRIPT_MESSAGE = "loadConnect was called but an existing Connect.js script already exists in the document; existing script parameters will be used";
const V0_URL = "https://connect-js.stripe.com/v0.1/connect.js";
const findScript = () => {
  return document.querySelectorAll(`script[src="${V0_URL}"]`)[0] || null;
};
const injectScript = () => {
  const script = document.createElement("script");
  script.src = "https://connect-js.stripe.com/v0.1/connect.js";
  const head = document.head;
  if (!head) {
    throw new Error("Expected document.head not to be null. Connect.js requires a <head> element.");
  }
  document.head.appendChild(script);
  return script;
};
let stripePromise = null;
const loadScript = () => {
  // Ensure that we only attempt to load Connect.js at most once
  if (stripePromise !== null) {
    return stripePromise;
  }
  stripePromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject("ConnectJS won't load when rendering code in the server - it can only be loaded on a browser. This error is expected when loading ConnectJS in SSR environments, like NextJS. It will have no impact in the UI, however if you wish to avoid it, you can switch to the `pure` version of the connect.js loader: https://github.com/stripe/connect-js#importing-loadconnect-without-side-effects.");
      return;
    }
    if (window.StripeConnect) {
      console.warn(EXISTING_SCRIPT_MESSAGE);
    }
    if (window.StripeConnect) {
      const wrapper = createWrapper(window.StripeConnect);
      resolve(wrapper);
      return;
    }
    try {
      let script = findScript();
      if (script) {
        console.warn(EXISTING_SCRIPT_MESSAGE);
      } else if (!script) {
        script = injectScript();
      }
      script.addEventListener("load", () => {
        if (window.StripeConnect) {
          const wrapper = createWrapper(window.StripeConnect);
          resolve(wrapper);
        } else {
          reject(new Error("Connect.js did not load the necessary objects"));
        }
      });
      script.addEventListener("error", () => {
        reject(new Error("Failed to load Connect.js"));
      });
    } catch (error) {
      reject(error);
    }
  });
  return stripePromise;
};
const hasCustomMethod = tagName => {
  return tagName in ConnectElementCustomMethodConfig;
};
const initStripeConnect = (stripePromise, initParams) => {
  const stripeConnectInstance = stripePromise.then(wrapper => wrapper.initialize(initParams));
  return {
    create: tagName => {
      let htmlName = componentNameMapping[tagName];
      if (!htmlName) {
        htmlName = tagName;
      }
      const element = document.createElement(htmlName);
      if (hasCustomMethod(tagName)) {
        const methods = ConnectElementCustomMethodConfig[tagName];
        for (const method in methods) {
          element[method] = function (value) {
            stripeConnectInstance.then(() => {
              this[`${method}InternalOnly`](value);
            });
          };
        }
      }
      stripeConnectInstance.then(instance => {
        element.setConnector(instance.connect);
      });
      return element;
    },
    update: updateOptions => {
      stripeConnectInstance.then(instance => {
        instance.update(updateOptions);
      });
    },
    debugInstance: () => {
      return stripeConnectInstance;
    },
    logout: () => {
      return stripeConnectInstance.then(instance => {
        instance.logout();
      });
    }
  };
};
const createWrapper = stripeConnect => {
  window.StripeConnect = window.StripeConnect || {};
  window.StripeConnect.optimizedLoading = true;
  const wrapper = {
    initialize: params => {
      var _a;
      const metaOptions = (_a = params.metaOptions) !== null && _a !== void 0 ? _a : {};
      const stripeConnectInstance = stripeConnect.init(Object.assign(Object.assign({}, params), {
        metaOptions: Object.assign(Object.assign({}, metaOptions), {
          sdk: true,
          sdkOptions: {
            // This will be replaced by the npm package version when bundling
            sdkVersion: "3.1.0-beta.1"
          }
        })
      }));
      return stripeConnectInstance;
    }
  };
  return wrapper;
};

const loadConnectAndInitialize = initParams => {
  const maybeConnect = loadScript();
  return initStripeConnect(maybeConnect, initParams);
};

export { loadConnectAndInitialize };
