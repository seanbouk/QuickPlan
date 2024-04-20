import ScheduleManager from './schedule-manager.js';

export function getWorkingHours(employeeName, date, task, scheduleManager) {
    const day = new Date(date).getDay();

    let eventType = "";
    if(task == "Vet Team Leader") {
        eventType = "Vet Team Leader";
    } else if (task == "0820-0830") {
        eventType = "Open";
    } else if (task.startsWith("AM") ) {
        eventType = "AM";
    } else if (task.startsWith("PM")) {
        eventType = "PM";
    } else if (task == "1800-1815") {
        eventType = "Close";
    } else if (task.startsWith("Huddersfield")) {
        eventType = "Huddersfield";
    } else if (task.startsWith("Off")) {
        eventType = "Off"
    } else {
        console.log("ERROR: task unknown: ", employeeName, date, task, scheduleManager);
    }

    let dayHours = 0;

    switch (eventType) {
        case "Vet Team Leader":
            return [540, 1050];
            break;
        case "Open":
            return [500, 510];
            break;
        case "AM":
            dayHours = scheduleManager.getWorkingHours(employeeName, day);
            switch (dayHours) {
                case 540:
                    return [510, 810];
                    break;
                case 450:
                    return [540, 780];
                    break;
                case 0:
                    return [];
                    break;
                default:
                    console.log("Day hours value is not recognized.", employeeName, day, dayHours);
            }
            return scheduleManager.getWorkingHours(employeeName, day);
            break;
        case "PM":
            dayHours = scheduleManager.getWorkingHours(employeeName, day);
            switch (dayHours) {
                case 540:
                    return [840, 1080];
                    break;
                case 450:
                    return [840, 1050];
                    break;
                case 0:
                    return [];
                    break;
                default:
                    console.log("Day hours value is not recognized.", employeeName, day, dayHours);
            }
            return scheduleManager.getWorkingHours(employeeName, day);
            break;
        case "Close":
            return [1080, 1095];
            break;
        case "Huddersfield":
            return [540, 1050];
            break;
        case "Off":
            return [];
            break;
        default:
            console.log("Unknown event type.");
            return(-1);
    }
}

export function minutesToMilitaryTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hoursFormatted = hours.toString().padStart(2, '0');
    const minsFormatted = mins.toString().padStart(2, '0');
    return hoursFormatted + minsFormatted;
}