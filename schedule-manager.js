class ScheduleManager {
    constructor(events) {
        const eventsPerDay = events.length

        this.eventsPerDay = eventsPerDay;
        this.employees = [];
        this.schedule = {};
        this.events = events;
    }

    addEmployee(employeeName, mon, tue, wed, thu, fri) {
        this.employees.push([employeeName, mon, tue, wed, thu, fri]);
    }

    getWorkingHours(employeeName, day) {
        if(this.employees.some(([name]) => name === employeeName)) {
            const employee = this.employees.find(([name]) => name === employeeName);
            return employee[day];
        } else {
            return "";
        }    
    }

    getPreviousMonday(date) {
        const dayOfWeek = date.getDay();
    
        if (dayOfWeek === 1) {
            return new Date(date);
        }
    
        const diffToMonday = dayOfWeek - 1;
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsToSubtract = diffToMonday * millisecondsInDay;
    
        const previousMonday = new Date(date.getTime() - millisecondsToSubtract);
        
        return previousMonday;
    }

    addWeek(date) {
        const weekStartDate = this.getPreviousMonday(new Date(date));
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStartDate);
            day.setDate(day.getDate() + i);
            const dayKey = day.toISOString().split('T')[0];
            this.schedule[dayKey] = Array.from({ length: this.eventsPerDay }, (_, index) => ({
                name: this.events[index],
                index,
                assignedTo: null,
            }));
        }
    }

    removeWeek(weekStartDate) {
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStartDate);
            day.setDate(day.getDate() + i);
            const dayKey = day.toISOString().split('T')[0];
            delete this.schedule[dayKey];
        }
    }

    serializeSchedule() {
        return JSON.stringify(this.schedule);
    }

    loadSchedule(serializedSchedule) {
        this.schedule = JSON.parse(serializedSchedule);
    }

    getWeekData(weekStartDate) {
        const weekData = {};
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStartDate);
            day.setDate(day.getDate() + i);
            const dayKey = day.toISOString().split('T')[0];
            weekData[dayKey] = this.schedule[dayKey];
        }
        return weekData;
    }

    assignEvent(date, eventIndex, employeeName) {
        // Attempt to create a Date object from the input date
        const dateObj = new Date(date);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
            console.log('Invalid date format');
            return;
        }
        
        // Ensure month and day are formatted as two digits
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        // Reformat date to YYYY-MM-DD
        const formattedDate = `${dateObj.getFullYear()}-${month}-${day}`;
        
        // Use the formatted date for the rest of the function
        if (!this.employees.some(([name]) => name === employeeName)) {
            if(employeeName) {
                console.log('Invalid employee name', formattedDate, employeeName);
                return;
            }
        }
    
        if (!this.schedule[formattedDate]) {
            this.addWeek(formattedDate);
        }
    
        const event = this.schedule[formattedDate].find(event => event.index === eventIndex);
        if (event) {
            if (employeeName !== null) {
                event.assignedTo = employeeName;
            } else {
                event.assignedTo = -1;
            }
        } else {
            console.log('Event not found');
        }
    }
}

export default ScheduleManager;