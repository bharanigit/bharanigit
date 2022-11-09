function calculateDaysBetweenDates(begin, end) {
    var beginDate = new Date(begin);
    var endDate = new Date(end);
    var days = (endDate.getTime() - beginDate.getTime()) / (1000 * 60 * 60 * 24);
    return days;
}

// express server on port 3000

// Return the current time in the format: 2018-01-01 12:00:00       
