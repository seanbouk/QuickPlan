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

    const updateSchedule = function(weekOffset) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1 + (weekOffset * 7)); // Adjust to Monday of the desired week
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
    updateSchedule(weekOffset);

    $('#prevWeek').click(function() {
        weekOffset--;
        updateSchedule(weekOffset);
    });

    $('#nextWeek').click(function() {
        weekOffset++;
        updateSchedule(weekOffset);
    });
});