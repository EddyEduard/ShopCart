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

cardNumberElement.mount("#card-number");

const cardExpiryElement = elements.create("cardExpiry", {
    style: style,
    placeholder: "MM / YY",
});

cardExpiryElement.mount("#card-expiration");

const cardCvcElement = elements.create("cardCvc", {
    style: style,
    placeholder: "CVC",
});

cardCvcElement.mount("#card-cvc");

// Proceed the payment for products.

const cardHolderTag = document.getElementById("card-holder");
const paymentButtonTag = document.getElementById("payment");
const paymentButtonTextTag = document.getElementById("payment-button-text");
const paymentButtonSpinnerTag = document.getElementById("payment-button-spinner");
const paymentSuccessedTag = document.getElementById("payment-successed");
const paymentFailedTag = document.getElementById("payment-failed");

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

paymentButtonTag.addEventListener("click", _ => {
    const options = {
        name: cardHolderTag.value
    };

    paymentStarted();

    stripe.createToken(cardNumberElement, options).then(result => {
        fetch("/shop/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: result.token.id }),
        }).then(response => response.json())
            .then(_ => {
                paymnetEnded();

                paymentSuccessed();
            })
            .catch(_ => {
                paymnetEnded();

                paymentFailed();
            });
    });
});