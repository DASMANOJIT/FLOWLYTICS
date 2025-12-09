"use client";

import { useState } from "react";
import "./calender.css";

export default function CalendarBox() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // total days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // first day index (0 = Sunday)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
        month: "long",
    });

    return (
        <div className="calendar-wrapper-custom">
            
            {/* ✅ Month Selector moved ABOVE calendar */}
            <div className="month-switcher">
                <button onClick={prevMonth} className="switch-btn">‹</button>
                <span className="month-label">{monthName} {currentYear}</span>
                <button onClick={nextMonth} className="switch-btn">›</button>
            </div>

            <div className="calendar-box-custom">
                
                {/* Weekdays Header */}
                <div className="weekdays-row">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                        <div key={i} className="weekday">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="days-grid">
                    {/* empty cells before first day */}
                    {Array(firstDay)
                        .fill(null)
                        .map((_, i) => (
                            <div key={"e" + i} className="empty-day"></div>
                        ))}

                    {/* actual days */}
                    {Array.from({ length: daysInMonth }, (_, i) => (
                        <div key={i} className="calendar-day">
                            <span>{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
