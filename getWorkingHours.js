import ScheduleManager from './schedule-manager.js';

export function getWorkingHours(employeeNameName, date, task, scheduleManager) {
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
        console.log("ERROR: task unknown: ", employeeNameName, date, task, scheduleManager);
    }

    let dayHours = 0;

    switch (eventType) {
        case "Vet Team Leader":
            return "0900-1730";
            break;
        case "Open":
            return "0820-0830";
            break;
        case "AM":
            dayHours = scheduleManager.getWorkingHours(employeeNameName, day);
            console.log(dayHours);
            switch (dayHours) {
                case 9:
                    return "0830-1330";
                    break;
                case 7.5:
                    return "0900-1300";
                    break;
                case 0:
                    return "-";
                    break;
                default:
                    console.log("Day hours value is not recognized.", employeeNameName, day, dayHours);
            }
            return scheduleManager.getWorkingHours(employeeNameName, day);
            break;
        case "PM":
            dayHours = scheduleManager.getWorkingHours(employeeNameName, day);
            console.log(dayHours);
            switch (dayHours) {
                case 9:
                    return "1400-1800";
                    break;
                case 7.5:
                    return "1400-1730";
                    break;
                case 0:
                    return "-";
                    break;
                default:
                    console.log("Day hours value is not recognized.", employeeNameName, day, dayHours);
            }
            return scheduleManager.getWorkingHours(employeeNameName, day);
            break;
        case "Close":
            return "1800-1815"
            break;
        case "Huddersfield":
            return "0900-1730";
            break;
        case "Off":
            return "-";
            break;
        default:
            console.log("Unknown event type.");
            return(-1);
    }
}
