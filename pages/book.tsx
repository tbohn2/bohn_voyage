import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/checkoutForm";
import Image from "next/image";

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
        <div className="min-h-screen relative py-8 px-4">
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/images/river.jpg"
                    alt="River background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-quaternary/45"></div>
            </div>
            <div className="relative z-10 max-w-4xl mx-auto bg-white/80 rounded-xl p-6 md:p-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-bold text-secondary mb-2">Book Your Float</h1>
                    <p className="text-xl text-secondary italic">Reserve your inflatable platforms for an unforgettable river adventure</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${step >= stepNum
                                        ? 'bg-secondary text-white shadow-md'
                                        : 'bg-white text-gray-400 border-2 border-gray-300'
                                        }`}
                                >
                                    {stepNum}
                                </div>
                                {stepNum < 4 && (
                                    <div
                                        className={`w-12 h-1 transition-all duration-300 ${step > stepNum ? 'bg-secondary' : 'bg-gray-300'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="">
                    {/* Selected Date Display */}
                    {step > 1 && dateTime && (
                        <div className="mb-6 p-4 bg-primary/30 rounded-lg border border-secondary/20">
                            <p className="text-sm text-gray-600 mb-1">Selected Date & Time</p>
                            <p className="text-lg font-semibold text-secondary">
                                {dateTime.toLocaleString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Booking Summary */}
                    {step > 2 && tubeTypes.length > 0 && (
                        <div className="mb-6 p-4 bg-primary/30 rounded-lg border border-secondary/20">
                            <h3 className="text-lg font-semibold text-secondary mb-3">Booking Summary</h3>
                            <div className="space-y-2 mb-3">
                                {tubeTypes.map((tube) => (
                                    <div key={tube.tubeTypeId} className="flex justify-between items-center">
                                        <span className="text-gray-700 font-medium">{uppercaseFirstLetter(tube.size)}</span>
                                        <span className="text-gray-600">{tube.numOfTubesBooked} × ${availableTubes.find((t) => t.tube_type_id === tube.tubeTypeId)?.price || 0}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-secondary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-secondary">Total:</span>
                                    <span className="text-2xl font-bold text-secondary">${price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Date & Time Selection */}
                    {step === 1 && (
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-xl font-semibold text-secondary mb-4 text-center">
                                    Select Date & Time
                                </label>
                                <div className="w-full">
                                    <DatePicker
                                        selected={dateTime}
                                        onChange={(val) => setDateTime(val)}
                                        showTimeSelect
                                        timeFormat="hh:mm aa"
                                        timeIntervals={30}
                                        timeCaption="Time"
                                        dateFormat="MMMM d, yyyy hh:mm aa"
                                        className="text-center rounded-lg border-2 border-secondary bg-white p-4 text-secondary font-semibold cursor-pointer w-full hover:border-secondary/80 transition-colors"
                                        calendarClassName="!bg-white !border-secondary font-sans shadow-xl"
                                        dayClassName={(d) =>
                                            "text-sm rounded-full hover:bg-primary transition-colors " +
                                            (d.getDay() === 0 ? "text-red-500" : "text-gray-800")
                                        }
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={fetchAvailableTubes}
                                className="w-full bg-secondary text-white font-semibold py-4 px-6 rounded-lg text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
                            >
                                Check Availability
                            </button>
                        </div>
                    )}

                    {/* Step 2: Tube Selection */}
                    {step === 2 && (
                        <div className="flex flex-col gap-6">
                            <label className="text-xl font-semibold text-secondary mb-2 text-center">
                                Select Tubes & Quantities
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {availableTubes.map((tube) => (
                                    <div
                                        key={tube.tube_type_id}
                                        className="border-2 border-secondary/30 rounded-lg p-4 hover:border-secondary/60 transition-colors bg-white"
                                    >
                                        <div className="text-center mb-3">
                                            <div className="text-xl font-bold text-secondary mb-1">
                                                {uppercaseFirstLetter(tube.size)}
                                            </div>
                                            <div className="text-lg font-semibold text-gray-700 mb-1">
                                                ${tube.price}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {tube.available_quantity} available
                                            </div>
                                        </div>
                                        <input
                                            onChange={(e) => handleTubeTypeChange(tube.tube_type_id, parseInt(e.target.value) || 0)}
                                            type="number"
                                            className="w-full px-4 py-2 border-2 border-secondary/30 rounded-lg text-center text-lg font-semibold text-secondary focus:border-secondary focus:outline-none transition-colors"
                                            min={0}
                                            max={tube.available_quantity}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>
                            {price > 0 && (
                                <div className="mt-4 p-4 bg-primary/20 rounded-lg">
                                    <div className="text-center">
                                        <span className="text-lg font-semibold text-gray-700">Subtotal: </span>
                                        <span className="text-2xl font-bold text-secondary">${price.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 border-2 border-secondary text-secondary font-semibold py-3 px-6 rounded-lg hover:bg-secondary/10 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={tubeTypes.length === 0 || price === 0}
                                    className="flex-1 bg-secondary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Customer Details */}
                    {step === 3 && (
                        <form
                            onChange={handleCustomerDetailsChange}
                            onSubmit={(e) => verifyAuthStatus(e)}
                            className="flex flex-col gap-6"
                        >
                            <label className="text-xl font-semibold text-secondary mb-2 text-center">
                                Enter Your Details
                            </label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        className="w-full px-4 py-3 border-2 border-secondary/30 rounded-lg text-secondary focus:border-secondary focus:outline-none transition-colors"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="w-full px-4 py-3 border-2 border-secondary/30 rounded-lg text-secondary focus:border-secondary focus:outline-none transition-colors"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        className="w-full px-4 py-3 border-2 border-secondary/30 rounded-lg text-secondary focus:border-secondary focus:outline-none transition-colors"
                                        placeholder="(555) 123-4567"
                                        required
                                    />
                                </div>
                            </div>
                            {pollingAuthStatus ? (
                                <div className="p-4 bg-primary/30 rounded-lg text-center">
                                    <p className="text-lg font-medium text-secondary">
                                        Waiting for email verification...
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Please check your email and click the verification link.</p>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 border-2 border-secondary text-secondary font-semibold py-3 px-6 rounded-lg hover:bg-secondary/10 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-secondary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-md"
                                    >
                                        Verify Email
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {/* Step 4: Payment */}
                    {step === 4 && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-semibold text-secondary text-center mb-2">
                                Complete Your Payment
                            </h2>
                            <Elements stripe={stripePromise}>
                                <CheckoutForm clientSecret={clientSecret} />
                            </Elements>
                        </div>
                    )}
                </div>

                {/* Cancel Button */}
                {step !== 1 && !pollingAuthStatus && (
                    <div className="text-center">
                        <button
                            onClick={clearStates}
                            className="text-gray-600 hover:text-gray-800 font-medium underline transition-colors"
                        >
                            Cancel Booking
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
