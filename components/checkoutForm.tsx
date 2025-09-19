import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function CheckoutForm({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardNumberElement)!,
            },
        });

        if (result.error) console.error(result.error.message);
        else if (result.paymentIntent?.status === "succeeded") console.log("Payment succeeded!");
    };

    const inputStyle = {
        base: {
            fontSize: "16px",
            color: "#424770",
            "::placeholder": { color: "#aab7c4" },
            fontFamily: "sans-serif",
            lineHeight: "1.5",
        },
        invalid: { color: "#9e2146" },
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-2 w-full max-w-md">
            <div className="mb-4 w-full">
                <label className="block mb-2">Card Number</label>
                <div className="p-2 border border-gray-300 rounded-lg bg-white">
                    <CardNumberElement options={{ style: inputStyle }} />
                </div>
            </div>

            <div className="mb-4 w-full">
                <label className="block mb-2">Expiry</label>
                <div className="p-2 border border-gray-300 rounded-lg bg-white">
                    <CardExpiryElement options={{ style: inputStyle }} />
                </div>
            </div>

            <div className="mb-4 w-full">
                <label className="block mb-2">CVC</label>
                <div className="p-2 border border-gray-300 rounded-lg bg-white">
                    <CardCvcElement options={{ style: inputStyle }} />
                </div>
            </div>

            <button type="submit" className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Pay</button>
        </form>
    );
}
