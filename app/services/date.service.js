var moment = require('moment');

function calculateWeekEndForAMonth(month){
    const monthNumber = moment().month(month).format("M");
    const weekendDates = sundaysInMonth(monthNumber, moment().format('YYYY'));

    return weekendDates;
}

function getStartAndEndOfMonth(month){
    const monthNumber = moment().month(month).format("M");
    const monthStart = moment(moment().format('YYYY')+'-'+monthNumber+1+'-1').startOf('month').format('YYYY-MM-DD');
    const monthEnd = moment(moment().format('YYYY')+'-'+monthNumber+1+'-1').endOf('month').format('YYYY-MM-DD')

    return { start: monthStart, end: monthEnd }
}

function sundaysInMonth( m, y ) {
    var days = new Date( y,m,0 ).getDate();
    var sundays = [ 8 - (new Date( m +'/01/'+ y ).getDay()) ];
    for ( var i = sundays[0] + 7; i < days; i += 7 ) {
      sundays.push(moment().format('YYYY')+'-'+m+'-'+i);
    }
    sundays[0] = moment().format('YYYY')+'-'+m+'-'+sundays[0];

    return sundays;
  }

module.exports = {
    calculateWeekEndForAMonth,
    getStartAndEndOfMonth
}