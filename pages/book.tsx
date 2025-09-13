import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

export default function Book() {
    const apiUrl = process.env.API_URL;

    const [dateTime, setDateTime] = useState<Date | null>(new Date());

    const fetchAvailableTubes = async () => {
        if (!dateTime) return;

        const startDate = dateTime;
        const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24);
        const response = await fetch(`${apiUrl}/tube-availability/?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);

        const data = await response.json();
        console.log(data);
    }

    return (
        <div className="flex flex-col justify-center items-center p-4">
            <h1>Book</h1>

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
        </div>
    );
}
