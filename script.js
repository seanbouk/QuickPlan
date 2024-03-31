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

        for (let row = 0; row < eventNames.length; row++) {
            const tr = $('<tr></tr>');

            tr.append(`<td>${eventNames[row]}</td>`);

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

    function addEmployee(name) {
        scheduleManager.addEmployee(name); // Add to the schedule manager
        $('#players').append(`<li>${name}</li>`); // Add to the ordered list
    }

    let weekOffset = 0;

    $('#prevWeek').click(function() {
        weekOffset--;
        updateSchedule(weekOffset);
    });

    $('#nextWeek').click(function() {
        weekOffset++;
        updateSchedule(weekOffset);
    });

    $(document).keydown(function(e) {
        let index = -1; // Default to an invalid index

        if (e.key >= 1 && e.key <= 9) {
            // For numbers 1-9, directly map keys to list item indices (subtract 1 for zero-based indexing)
            index = e.key - 1;
        } else if (e.key === '0') {
            // Map '0' to the 10th item
            index = 9;
        } else if (e.key === '-') {
            // Map '-' to the 11th item
            index = 10;
        } else if (e.key === '=') {
            // Map '=' to the 12th item
            index = 11;
        }

        if (index !== -1 && index < $('#players li').length) {
            // Remove highlighting from all list items
            $('#players li').removeClass('highlighted');

            // Highlight the corresponding list item
            $('#players li').eq(index).addClass('highlighted');
        }
    });

    $('#schedule').on('click', 'td', function() {
        // Get the text of the currently highlighted list item
        const highlightedText = $('#players .highlighted').text();

        // Check if clicked cell is in the leftmost column and there's highlighted text
        if ($(this).index() === 0 && highlightedText) {
            // Fill all cells to the right in the same row with the highlighted text
            for (let i = 0; i < 5; i++){
                const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
                startDate.setDate(startDate.getDate()+i);
                scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), highlightedText);
            }
            updateSchedule(weekOffset);
        }
        // Ensure the clicked cell is not in the leftmost column
        else if ($(this).index() !== 0) {
            const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
            startDate.setDate(startDate.getDate()+$(this).index()-1);
            scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), highlightedText);
            updateSchedule(weekOffset);
        }
    });

    // Set event names as provided in your example
    const eventNames = [
        "0820-0830", 
        "AM Consult 1", "AM Consult 2", "AM Consult 3", "AM Consult 4", "AM Consult 5",
        "AM Ops 1", "AM Ops 2", "AM Ops 3",
        "PM Consult 1", "PM Consult 2", "PM Consult 3", "PM Consult 4", "PM Consult 5",
        "PM Ops 1", "PM Ops 2", "PM Ops 3",
        "1800-1815",
        "Huddersfield 1", "Huddersfield 2",
        "Off 1", "Off 2", "Off 3", "Off 4"
    ];

    // Initialize ScheduleManager with 18 events per day
    const scheduleManager = new ScheduleManager(eventNames.length);

    // Example: Adding a week starting from a specific date
    const weekStartDate = getMonday(weekOffset);
    scheduleManager.addWeek(weekStartDate);

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
    addEmployee("RW");
    addEmployee("ND");
    addEmployee("AB");
    addEmployee("HC");
    addEmployee("KW");
    addEmployee("DC");
    addEmployee("MI");
    addEmployee("SBC");
    addEmployee("JW");
    addEmployee("JB");
    addEmployee("RT");

    // PDSA Setup
    scheduleManager.assignEvent('2024-03-19', 0, 'RW');
    scheduleManager.assignEvent('2024-03-19', 1, 'RT');
    scheduleManager.assignEvent('2024-03-19', 2, 'KW');
    scheduleManager.assignEvent('2024-04-01', 2, 'KW');
    //console.log(scheduleManager.serializeSchedule());

    
    updateSchedule(weekOffset);
});