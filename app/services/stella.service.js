const db = require("../models");
const { QueryTypes } = require('sequelize');
const validation = require("../services/validation.service");
var _ = require('lodash');
const { query } = require("express");
var moment = require('moment');

exports.filterStellaListings = async (searchParams) => {

    console.log(searchParams);
    const sanitization = validation.inputValidation(searchParams);
    if(sanitization.error == false){
        result = {match: [], alternative: [], other: []}
        let matchQuery = getBaseQueryByCity(searchParams.city);

        if (!_.isEmpty(searchParams.date)){
            matchQuery += checkIfAvailableByDate(searchParams.date.start, searchParams.date.end);

        } else if (!_.isEmpty(searchParams.flexible)){

            switch(searchParams.flexible.type) {
                case "weekend":
                    _.forEach(searchParams.flexible.months, function(month) {
                        let weekendDates =  calculateWeekEndForAMonth(month, searchParams);
                        _.forEach(weekendDates, function(endDate) {
                            let startDate;
                            if(searchParams.city.toLowerCase() != 'dubai'){
                                startDate =  getFormattedDate(endDate, 1);
                            } else {
                                startDate =  getFormattedDate(endDate, 2);
                                endDate =  getFormattedDate(endDate, 1);
                            }
                            matchQuery += checkIfAvailableByDate(startDate, endDate)
                          });
                      });
                    break;
                case "week":
                    _.forEach(searchParams.flexible.months, function(month) {
                        let weekDates =  calculateWeekEndForAMonth(month, searchParams);
                        _.forEach(weekDates, function(endDate) {
                            const startDate =  getFormattedDate(endDate, 6);
                            matchQuery += checkIfAvailableByDate(startDate, endDate)
                          });
                      });
                    break;
                  break;
                case "month":
                    _.forEach(searchParams.flexible.months, function(month) {
                        const dateRange =  getStartAndEndOfMonth(month, 6);
                        matchQuery += checkIfAvailableByDate(dateRange.start, dateRange.end);
                      });
                  break;
                default:
                    matchQuery += ``;
              }
        }

        if (!_.isEmpty(searchParams.amenities)){
            matchQuery += filterByAminities(searchParams.amenities);
        }

        if (!_.isEmpty(searchParams.apartmentType)){
            matchQuery += filterByPropertyType(searchParams.apartmentType)
        }

        matchQuery += groupByClause();
        const exactMatchStays = await executeQuery(matchQuery);

        if(!_.isEmpty(exactMatchStays)){
            result.match.push(exactMatchStays)
        }
        
        return result;
    } else {
        return sanitization;
    }
};

function executeQuery(matchQuery){
    return db.sequelize.query(matchQuery, { type: QueryTypes.SELECT });
}

function groupByClause(){
    return ` group by p.id`;
}

function filterByAminities(amenities){
    let query = ``;
    _.forEach(amenities, function(amenitie) {
        query += ` AND amenities::text ilike '%`+ amenitie +`%'`
    });

    return query;
}

function filterByPropertyType(apartmentType){
    return ` AND property_type::text = '`+ apartmentType +`'`
}

function getFormattedDate(date, subtractDays){
    return  moment(date, 'YYYY-MM-DD').subtract(subtractDays,'days').format('YYYY-MM-DD');
}

function getBaseQueryByCity(city){
    const query = `select p.* from property p 
    LEFT join availability a ON (p.id = a.property_id and is_blocked = true)
    LEFT join reservation r ON (p.id = r.property_id)
    LEFT join building b ON b.id = p.building_id
    where  b.city='`+ city + `'`;

    return query;
}

function checkIfAvailableByDate(startDate, endDate) {
    const query = ` AND
    (('`+ startDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ startDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)
    AND (('`+ endDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ endDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)`;

    return query;
}

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