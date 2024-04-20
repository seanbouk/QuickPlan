import ScheduleManager from './schedule-manager.js';
import { getWorkingHours } from './getWorkingHours.js';
import { minutesToMilitaryTime } from './getWorkingHours.js';

$(document).ready(function() {
    $(document).on('contextmenu', function(event) {
        event.preventDefault();
    });

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

                        if(eventText == -1) {
                            $(cellSelector).addClass('blocked');
                        } else {
                            $(cellSelector).text(eventText);
                            if(eventText) {
                                const workingHours = getWorkingHours(eventText, date, event.name, scheduleManager);

                                if(workingHours[0] && workingHours[1]) {
                                    const subHeading = minutesToMilitaryTime(workingHours[0]) + "-" + minutesToMilitaryTime(workingHours[1]);
                                    $(cellSelector).append($('<span>').addClass('note').text(subHeading));
                                } else {
                                    $(cellSelector).append($('<span>').addClass('note').text("-"));
                                }
                            }
                        }
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

        saveScheduleToCookie();
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

    function addEmployee(name, mon, tue, wed, thu, fri) {
        scheduleManager.addEmployee(name, mon, tue, wed, thu, fri); // Add to the schedule manager
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

        updateHighlightedPlayer(index);
    });

    $('#players').on('click', 'li', function() {
        const index = $(this).index();
        
        updateHighlightedPlayer(index);
    });

    function updateHighlightedPlayer(index) {
        if (index !== -1 && index < $('#players li').length) {
            $('#players li').removeClass('highlighted');
            $('#players li').eq(index).addClass('highlighted');

            const employeeName = scheduleManager.getEmployeeNameByIndex(index);
            let currentDate = new Date(getMonday(weekOffset));
            const listItem = $('#players li').eq(index);
            listItem.empty();
            listItem.text(employeeName + " ");

            for (let i = 1; i <= 5; i++) {
                // Get the scheduled minutes and working minutes
                const scheduledMins = scheduleManager.getScheduledHours(employeeName, currentDate);
                const workingMins = scheduleManager.getWorkingHours(employeeName, i);
            
                // Convert scheduled minutes to hours
                const scheduledHours = scheduledMins / 60;
            
                // Determine the class based on the comparison
                let className = '';
                if (scheduledMins < workingMins) {
                    className = 'under';
                } else if (scheduledMins === workingMins) {
                    className = 'same';
                } else {
                    className = 'over';
                }
            
                // Prepare the content to be added to the list item
                const content = `<span class="${className}">${scheduledHours.toFixed(1)}</span>`;
            
                // Append the content to the list item
                listItem.append(content);
            
                // If not the last item, append a comma
                if (i < 5) {
                    listItem.append(" ");
                }
            
                // Move to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    $('#schedule').on('mousedown', 'td', function(event) {
        switch (event.which) {
            case 1:
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
                break;
            case 2:
                if ($(this).index() === 0) {
                    // Fill all cells to the right in the same row with the highlighted text
                    for (let i = 0; i < 5; i++){
                        const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
                        startDate.setDate(startDate.getDate()+i);
                        scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), "");
                    }
                    updateSchedule(weekOffset);
                }
                else {
                    const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
                    startDate.setDate(startDate.getDate()+$(this).index()-1);
                    scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), "");
                    updateSchedule(weekOffset);
                }
                break;
            case 3:
                if ($(this).index() === 0) {
                    // Fill all cells to the right in the same row with the highlighted text
                    for (let i = 0; i < 5; i++){
                        const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
                        startDate.setDate(startDate.getDate()+i);
                        scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), null);
                    }
                    updateSchedule(weekOffset);
                }
                else {
                    const startDate = new Date(getMonday(weekOffset));//assumes you're editing the current week
                    startDate.setDate(startDate.getDate()+$(this).index()-1);
                    scheduleManager.assignEvent(startDate, $(this).parent('tr').index(), null);
                    updateSchedule(weekOffset);
                }
                break;
        }

        
    });

    function saveScheduleToCookie() {
        const serializedSchedule = scheduleManager.serializeSchedule();
        const daysToExpire = 365 * 10;
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        const expires = "expires=" + expiryDate.toUTCString();
        
        localStorage.setItem('scheduleManager', encodeURIComponent(serializedSchedule));
    }

    function loadScheduleFromCookie() {
        const scheduleCookie = localStorage.getItem('scheduleManager');
        //console.log(scheduleCookie);
        if (scheduleCookie) {
            const serializedSchedule = decodeURIComponent(scheduleCookie);
            scheduleManager.loadSchedule(serializedSchedule);
        }
    }

    const eventNames = [
        "Vet Team Leader", "0820-0830", 
        "AM Consult 1", "AM Consult 2", "AM Consult 3", "AM Consult 4", "AM Consult 5",
        "AM Ops 1", "AM Ops 2", "AM Ops 3",
        "PM Consult 1", "PM Consult 2", "PM Consult 3", "PM Consult 4", "PM Consult 5",
        "PM Ops 1", "PM Ops 2", "PM Ops 3",
        "1800-1815",
        "Huddersfield\u00A01", "Huddersfield\u00A02",
        "Off 1", "Off 2", "Off 3", "Off 4"
    ];

    const scheduleManager = new ScheduleManager(eventNames);

    const weekStartDate = getMonday(weekOffset);
    scheduleManager.addWeek(weekStartDate);

    // PDSA staff
    addEmployee("RW", 540, 540, 540, 540, 0);    // Mon-Thu long days
    addEmployee("ND", 540, 540, 540, 540, 0);    // Mon-Thu long days
    addEmployee("AB", 450, 450, 0, 450, 450);    // Mon, Tue (not working), Thu, Fri
    addEmployee("HC", 450, 450, 450, 450, 450);  // Mon-Fri
    addEmployee("KW", 450, 450, 450, 0, 450);    // Mon, Tue, Wed (not working), Fri
    addEmployee("MI", 225, 450, 450, 450, 225);  // 4 days - off Monday morning, Friday afternoon
    addEmployee("SBC", 450, 450, 450, 450, 450); // Mon-Fri
    addEmployee("JW", 450, 450, 450, 0, 450);    // Mon, Tue, Wed, Fri - one Thu in four - 6 or 8 hours?
    addEmployee("JB", 450, 0, 450, 0, 450);      // Mon, Wed, Fri
    addEmployee("RT", 0, 450, 450, 450, 450);    // Tue-Fri

    loadScheduleFromCookie();
    
    updateSchedule(weekOffset);

    updateHighlightedPlayer(0);
});