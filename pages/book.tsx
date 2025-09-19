import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

export default function Book() {
    const apiUrl = process.env.API_URL;

    const [step, setStep] = useState<number>(1);
    // 1: Pick Date & Time to fetch available tubes
    // 2: Pick Tube Types to book and quantity
    // 3: Enter Customer Details
    // 4: Pick Payment Method
    const [dateTime, setDateTime] = useState<Date | null>(new Date());
    const [availableTubes, setAvailableTubes] = useState<any[]>([]);
    const [tubeTypes, setTubeTypes] = useState<{
        tubeTypeId: string,
        quantity: number,
        size: string
    }[]>([]);
    const [price, setPrice] = useState<number>(0);

    const uppercaseFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const handleTubeTypeChange = (tubeTypeId: string, quantity: number) => {
        if (isNaN(quantity)) return;

        const existingTubeType = tubeTypes.find((tube) => tube.tubeTypeId === tubeTypeId);
        const tubePrice = availableTubes.find((tube) => tube.tube_type_id === tubeTypeId)?.price;

        if (existingTubeType) {
            const oldPrice = existingTubeType.quantity * tubePrice;
            const newPrice = quantity * tubePrice;
            setPrice(price - oldPrice + newPrice);
            console.log(price, oldPrice, newPrice);

            existingTubeType.quantity = quantity;
            setTubeTypes([...tubeTypes]);

        } else {
            const tubeSize = availableTubes.find((tube) => tube.tube_type_id === tubeTypeId)?.size;
            setTubeTypes([...tubeTypes, { tubeTypeId, quantity, size: tubeSize }]);
            setPrice(price + quantity * tubePrice);
            console.log(price, quantity * tubePrice);
        }
    }

    const fetchAvailableTubes = async () => {
        if (!dateTime) return;

        try {
            const startDate = dateTime;
            const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24);
            const response = await fetch(`${apiUrl}/tube-availability/?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);

            const data = await response.json();
            console.log(data);
            setAvailableTubes(data.availability);
            setStep(2);
        } catch (error) {
            console.error(error);
        }
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
                                <p className="text-sm text-gray-500">{tube.quantity} booked</p>
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

                {/* {step === 3 && (
                    <div className="flex flex-col justify-center items-center gap-2 w-full max-w-md p-4">
                        <label className="text-lg font-medium">Enter Customer Details</label>
                        <input type="text" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Name" />
                        <input type="email" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Email" />
                        <input type="tel" className="w-full px-1 bg-gray-50 text-indigo-900" placeholder="Phone" />
                    </div>
                )}

                {step !== 1 && (
                    <button onClick={() => setStep(1)} className="rounded-lg border border-indigo-500 bg-gray-50 p-3 text-indigo-900 font-semibold cursor-pointer">Back</button>
                )} */}
            </div>
        </div>
    );
}
