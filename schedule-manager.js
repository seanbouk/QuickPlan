class ScheduleManager {
    constructor(eventsPerDay) {
        this.eventsPerDay = eventsPerDay;
        this.employees = [];
        this.schedule = {};
    }

    addEmployee(employeeName) {
        this.employees.push(employeeName);
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
                name: '',
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
        if (!this.employees.includes(employeeName)) {
            console.log('Invalid employee name', date, employeeName);
            return;
        }

        if (!this.schedule[date]) {
            this.addWeek(date);
        }

        const event = this.schedule[date].find(event => event.index === eventIndex);
        if (event) {
            event.assignedTo = employeeName;
        } else {
            console.log('Event not found');
        }
    }
}

export default ScheduleManager;