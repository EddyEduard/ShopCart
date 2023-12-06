// Setup Stripe card.

const stripe = Stripe("pk_test_51KPCNIKpSPgvCIhz8wNmc46BXcif8G4eiHDkZuyCqZRWSAEAP7leO5A0JHcAUws10jySszqwLwwzxP8kbCHdFhUj00tA05jPPD");
const elements = stripe.elements();
const style = {
    base: {
        iconColor: "#666EE8",
        fontSize: "20px",
        color: '#000000'
    }
};

const cardNumberElement = elements.create("cardNumber", {
    showIcon: true,
    style: style,
    placeholder: "XXXX XXXX XXXX XXXX",
});

if (document.getElementById("card-number") !== null)
    cardNumberElement.mount("#card-number");

const cardExpiryElement = elements.create("cardExpiry", {
    style: style,
    placeholder: "MM / YY",
});

if (document.getElementById("card-expiration") !== null)
    cardExpiryElement.mount("#card-expiration");

const cardCvcElement = elements.create("cardCvc", {
    style: style,
    placeholder: "CVC",
});

if (document.getElementById("card-cvc") !== null)
    cardCvcElement.mount("#card-cvc");

// Proceed the payment for products.

const cardHolderTag = document.getElementById("card-holder");
const paymentButtonTag = document.getElementById("payment");
const paymentButtonTextTag = document.getElementById("payment-button-text");
const paymentButtonSpinnerTag = document.getElementById("payment-button-spinner");
const paymentSuccessedTag = document.getElementById("payment-successed");
const paymentFailedTag = document.getElementById("payment-failed");
const downloadInvoiceTag = document.getElementById("download-invoice");

const paymentStarted = _ => {
    paymentButtonTextTag.classList.add("d-none");
    paymentButtonSpinnerTag.classList.remove("d-none");
};

const paymnetEnded = _ => {
    paymentButtonTextTag.classList.remove("d-none");
    paymentButtonSpinnerTag.classList.add("d-none");
};

const paymentSuccessed = _ => {
    paymentSuccessedTag.classList.remove("d-none");
    paymentFailedTag.classList.add("d-none");
};

const paymentFailed = _ => {
    paymentSuccessedTag.classList.add("d-none");
    paymentFailedTag.classList.remove("d-none");
};

const payForProducts = (token, cardHolder, isUpdateCard) => {
    fetch("/shop/checkout?isUpdateCard=" + isUpdateCard, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token, nameOnCard: cardHolder }),
    }).then(response => response.json())
        .then(data => {
            paymentButtonTag.classList.add("d-none");
            downloadInvoiceTag.href = data.invoice;

            paymnetEnded();

            paymentSuccessed();
        })
        .catch(_ => {
            paymnetEnded();

            paymentFailed();
        });
};

paymentButtonTag.addEventListener("click", _ => {
    const cardHolder = cardHolderTag != null ? cardHolderTag.value : "";
    const options = {
        name: cardHolder
    };

    paymentStarted();

    if (hasPaymentMethodAdded && !isUpdateCard)
        payForProducts("", "", false);
    else
        stripe.createToken(cardNumberElement, options).then(result => payForProducts(result.token.id, cardHolder, isUpdateCard));
});