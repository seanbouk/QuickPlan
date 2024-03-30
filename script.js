import ScheduleManager from './schedule-manager.js';

$(document).ready(function() {
    const updateTableHeaders = function(startDate) {
        const headers = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        for (let i = 0; i < headers.length; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateString = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
            $(`th.day-${i+1}`).text(`${headers[i]} (${dateString})`);
        }
    };

    const getMonday = function(weekOffset) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1 + (weekOffset * 7)); // Adjust to Monday of the desired week
        return startDate
    }

    const fillTableWithWeekData = function(weekStartDate) {
        const weekData = scheduleManager.getWeekData(weekStartDate);
        const tbody = $('#schedule tbody');
        
        let dayIndex = 0;
        Object.keys(weekData).forEach(date => {
            if (dayIndex < 5) { // Only Monday to Friday
                if(weekData[date]) {
                    weekData[date].forEach((event, eventIndex) => {
                        const cellSelector = `tr:eq(${eventIndex + 1}) td:eq(${dayIndex + 1})`;
                        const eventText = event.assignedTo ? `${event.assignedTo}` : "";
                        $(cellSelector).text(eventText);
                    });
                }
                dayIndex++;
            }
        });
    };

    const updateSchedule = function(weekOffset) {
        const startDate = getMonday(weekOffset);
        const weekYear = getWeekNumber(startDate);
        $('#weekInfo').text(`Week ${weekYear.week} of ${weekYear.year}`);
        updateTableHeaders(startDate);

        const tbody = $('#schedule tbody');
        tbody.empty(); // Clear previous rows

        for (let row = 0; row < 18; row++) {
            const tr = $('<tr></tr>');
            const session = row < 9 ? 'AM' : 'PM';
            const type = row % 9 < 3 ? 'Ops' : 'Consults';
            tr.append(`<td>${session} - ${type}</td>`);

            for (let day = 0; day < 5; day++) {
                tr.append(`<td></td>`); // Dates are shown in headers now
            }

            tbody.append(tr);
        }

        fillTableWithWeekData(startDate);
    };

    const getWeekNumber = function(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1)/7);

        // Calculate the year for the week
        let weekYear = d.getUTCFullYear();
        if (d.getMonth() == 11 && weekNumber == 1) {
            weekYear++;
        } else if (d.getMonth() == 0 && weekNumber > 51) {
            weekYear--;
        }

        return { week: weekNumber, year: weekYear };
    };

    let weekOffset = 0;

    $('#prevWeek').click(function() {
        weekOffset--;
        updateSchedule(weekOffset);
    });

    $('#nextWeek').click(function() {
        weekOffset++;
        updateSchedule(weekOffset);
    });

    // Initialize ScheduleManager with 18 events per day
    const scheduleManager = new ScheduleManager(18);

    // Example: Adding a week starting from a specific date
    const weekStartDate = getMonday(weekOffset);
    scheduleManager.addWeek(weekStartDate);

    // Set event names as provided in your example
    const eventNames = [
        "AM - Ops 1", "AM - Ops 2", "AM - Ops 3", "AM - Consults 1", "AM - Consults 2",
        "AM - Consults 3", "AM - Consults 4", "AM - Consults 5", "AM - Consults 6",
        "PM - Ops 1", "PM - Ops 2", "PM - Ops 3", "PM - Consults 1", "PM - Consults 2",
        "PM - Consults 3", "PM - Consults 4", "PM - Consults 5", "PM - Consults 6"
    ];

    // Initializing events for a week with names
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStartDate);
        day.setDate(day.getDate() + i);
        const dayKey = day.toISOString().split('T')[0];

        scheduleManager.schedule[dayKey].forEach((event, index) => {
            event.name = eventNames[index % eventNames.length];
        });
    }

    // PDSA staff
    scheduleManager.addEmployee("RW");
    scheduleManager.addEmployee("ND");
    scheduleManager.addEmployee("AB");
    scheduleManager.addEmployee("HC");
    scheduleManager.addEmployee("KW");
    scheduleManager.addEmployee("DC");
    scheduleManager.addEmployee("MI");
    scheduleManager.addEmployee("SBC");
    scheduleManager.addEmployee("JW");
    scheduleManager.addEmployee("JB");
    scheduleManager.addEmployee("RT");

    // PDSA Setup
    scheduleManager.assignEvent('2024-03-19', 0, 'RW');
    scheduleManager.assignEvent('2024-03-19', 1, 'RT');
    scheduleManager.assignEvent('2024-03-19', 2, 'KW');
    //console.log(scheduleManager.serializeSchedule());

    
    updateSchedule(weekOffset);
});