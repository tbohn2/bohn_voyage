import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/checkoutForm";

const stripePublishableKey = "pk_test_51RzVLLQx2SGTNQwzV5NKVucZcMj3dzWj96rNwUSZUhAEZwyfyvP9FFZMcuzgufbOxJQLzNy8fgtHeGgM5mXGEgKY007BWAK2xp";
const stripePromise = loadStripe(stripePublishableKey || '');
const apiUrl = process.env.API_URL;

export default function Book() {
    const [step, setStep] = useState<number>(1);
    // 1: Pick Date & Time to fetch available tubes
    // 2: Pick Tube Types to book and quantity
    // 3: Enter Customer Details
    // 4: Pick Payment Method
    const [dateTime, setDateTime] = useState<Date | null>(new Date());
    const [availableTubes, setAvailableTubes] = useState<any[]>([]);
    const [tubeTypes, setTubeTypes] = useState<{
        tubeTypeId: string,
        numOfTubesBooked: number,
        size: string
    }[]>([]);
    const [price, setPrice] = useState<number>(0);
    const [customer, setCustomer] = useState<{
        name: string,
        email: string,
        phone: string
    }>({
        name: '',
        email: '',
        phone: ''
    });
    const [pollingAuthStatus, setPollingAuthStatus] = useState<boolean>(false);
    const [clientSecret, setClientSecret] = useState<string>("");

    const clearStates = () => {
        setStep(1);
        setDateTime(new Date());
        setAvailableTubes([]);
        setTubeTypes([]);
        setPrice(0);
        setCustomer({
            name: '',
            email: '',
            phone: ''
        });
        setClientSecret("");
        setPollingAuthStatus(false);
    }


    const uppercaseFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const handleTubeTypeChange = (tubeTypeId: string, quantity: number) => {
        if (isNaN(quantity)) return;

        const existingTubeType = tubeTypes.find((tube) => tube.tubeTypeId === tubeTypeId);
        const tubePrice = availableTubes.find((tube) => tube.tube_type_id === tubeTypeId)?.price;

        if (existingTubeType) {
            const oldPrice = existingTubeType.numOfTubesBooked * tubePrice;
            const newPrice = quantity * tubePrice;
            setPrice(price - oldPrice + newPrice);

            existingTubeType.numOfTubesBooked = quantity;
            setTubeTypes([...tubeTypes]);

        } else {
            const tubeSize = availableTubes.find((tube) => tube.tube_type_id === tubeTypeId)?.size;
            setTubeTypes([...tubeTypes, { tubeTypeId, numOfTubesBooked: quantity, size: tubeSize }]);
            setPrice(price + quantity * tubePrice);
        }
    }

    const handleCustomerDetailsChange = (e: any) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    }

    const fetchAvailableTubes = async () => {
        if (!dateTime) return;

        try {
            const startDate = dateTime;
            const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24);
            const response = await fetch(`${apiUrl}/tube-availability/?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`, {
                credentials: 'include'
            });

            const data = await response.json();
            setAvailableTubes(data.availability);
            setStep(2);
        } catch (error) {
            console.error(error);
        }
    }

    const verifyAuthStatus = async (e: any) => {
        e.preventDefault();
        const response = await fetch(`${apiUrl}/customer-auth/`, {
            method: 'POST',
            body: JSON.stringify(customer),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();
        console.log(data);
        if (data.authenticated) {
            createPaymentIntent();
        } else {
            setPollingAuthStatus(true);
            pollAuthStatus();
        }
    }

    const pollAuthStatus = () => {
        const startTime = Date.now();
        const maxDuration = 10 * 60 * 1000; // 10 minutes

        const poll = async (delay: number) => {
            setTimeout(async () => {
                // Check if exceeded 10 minutes
                if (Date.now() - startTime >= maxDuration) {
                    console.log('Polling stopped after 10 minutes');
                    setPollingAuthStatus(false);
                    return;
                }

                const response = await fetch(`${apiUrl}/customer-auth/`, {
                    credentials: 'include'
                });
                const data = await response.json();
                console.log(data);

                if (data.authenticated) {
                    setPollingAuthStatus(false);
                    createPaymentIntent();
                    return;
                }

                // Determine next delay based on elapsed time
                const elapsed = Date.now() - startTime;
                let nextDelay;

                if (elapsed < 60 * 1000) { // First 1 minute: every 5 seconds
                    nextDelay = 5 * 1000;
                } else if (elapsed < 120 * 1000) { // Next minute: every 7 seconds
                    nextDelay = 7 * 1000;
                } else { // After 2 minutes: every 10 seconds
                    nextDelay = 10 * 1000;
                }

                poll(nextDelay);
            }, delay);
        };

        // Start polling after 15 seconds
        poll(15 * 1000);
    }

    const createPaymentIntent = async () => {
        if (!dateTime) return;

        const startTime = dateTime.toISOString();
        const endTime = new Date(dateTime.getTime() + 1000 * 60 * 60 * 24).toISOString();

        const response = await fetch(`${apiUrl}/create-payment-intent/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: price,
                currency: 'usd',
                start_time: startTime,
                end_time: endTime,
                tube_types: tubeTypes
            }),
            credentials: 'include'
        });
        const data = await response.json();
        setClientSecret(data.client_secret);
        setStep(4);
    }


    return (
        <div className="flex flex-col justify-center items-center p-4">
            <h1>Book</h1>

            <div className="flex flex-col justify-center items-center gap-2 w-full max-w-md p-4">

                {step > 1 && (
                    <h2 className="text-lg font-medium">{dateTime?.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</h2>
                )}

                {step > 2 && (
                    <div className="flex flex-col justify-center items-center gap-2 w-full max-w-md p-4">
                        <h2 className="text-lg font-medium">Total: ${price}</h2>
                        {tubeTypes.map((tube) => (
                            <div key={tube.tubeTypeId}>
                                <h2 className="text-lg font-medium">{tube.size}</h2>
                                <p className="text-sm text-gray-500">{tube.numOfTubesBooked} booked</p>
                            </div>
                        ))}
                    </div>
                )}

                {step === 1 && (
                    <div className="flex flex-col justify-center items-center gap-2 w-full max-w-md p-4">
                        <label className="text-lg font-medium">Pick Date & Time</label>
                        <div className="w-full">
                            <DatePicker
                                selected={dateTime}
                                onChange={(val) => setDateTime(val)}
                                showTimeSelect
                                timeFormat="hh:mm aa"
                                timeIntervals={30}
                                timeCaption="Time"
                                dateFormat="MMMM d, yyyy hh:mm aa"
                                className="text-center rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer"
                                calendarClassName="!bg-white !border-indigo-300 font-sans shadow-lg"
                                dayClassName={(d) =>
                                    "text-sm rounded-full hover:bg-indigo-100 " +
                                    (d.getDay() === 0 ? "text-red-500" : "text-gray-800")
                                }
                                wrapperClassName="w-full"
                            />
                        </div>
                        <button onClick={fetchAvailableTubes} className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Fetch Available Tubes</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="border border-indigo-500 rounded-lg p-4 flex flex-col justify-center items-center gap-2 w-full max-w-md">
                        <label className="text-lg font-medium">Pick Tube Types to book and quantity</label>
                        <div className="flex justify-center items-center gap-2 w-full max-w-md">
                            {availableTubes.map((tube) => (
                                <div key={tube.tube_type_id} className="flex flex-col justify-center items-center gap-2 w-full max-w-md">
                                    <div className="text-lg font-medium">{uppercaseFirstLetter(tube.size)}</div>
                                    <div className="text-sm text-gray-500">{tube.available_quantity} available</div>
                                    <input onChange={(e) => handleTubeTypeChange(tube.tube_type_id, parseInt(e.target.value))} type="number" className="w-full px-1 bg-gray-50 text-indigo-900" min={0} max={tube.available_quantity} />
                                </div>
                            ))}
                        </div>
                        <div className="text-lg font-medium">Total Price: ${price}</div>
                        <button onClick={() => setStep(3)} className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Next</button>
                    </div>
                )}

                {step === 3 && (
                    <form onChange={handleCustomerDetailsChange} onSubmit={(e) => verifyAuthStatus(e)} className="flex flex-col justify-center items-center gap-2 w-full max-w-md p-4">
                        <label className="text-lg font-medium">Enter Customer Details</label>
                        <input name="name" type="text" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Name" />
                        <input name="email" type="email" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Email" />
                        <input name="phone" type="tel" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Phone" />
                        {pollingAuthStatus ? (
                            <div className="text-lg font-medium">Polling for authentication status...</div>
                        ) : (
                            <button type="submit" className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Verify Email</button>
                        )}
                    </form>
                )}

                {step === 4 && (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                )}

                {step !== 1 && !pollingAuthStatus && (
                    <button onClick={clearStates} className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Cancel</button>
                )}
            </div>
        </div>
    );
}
