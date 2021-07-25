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
        let matchQuery = `select p.* from property p 
                          LEFT join availability a ON (p.id = a.property_id and is_blocked = true)
                          LEFT join reservation r ON (p.id = r.property_id)
                          LEFT join building b ON b.id = p.building_id
                          where  b.city='`+ searchParams.city + `'`;

        if (!_.isEmpty(searchParams.date)){
            matchQuery += checkIfAvailableByDate(searchParams.date.start, searchParams.date.end);

        } else if (!_.isEmpty(searchParams.flexible)){

            switch(searchParams.flexible.type) {
                case "weekend":
                    _.forEach(searchParams.flexible.months, function(month) {
                        let weekendDates =  calculateWeekEndForAMonth(month, searchParams);
                        console.log(weekendDates);
                        _.forEach(weekendDates, function(endDate) {
                            const startDate = moment(endDate, 'YYYY-MM-DD').subtract(1,'days').format('YYYY-MM-DD');
                            matchQuery += checkIfAvailableByDate(startDate, endDate)
                          });
                      });
                    break;
                case "week":
                  // I plan to do a similar implementation to find week start and end date and reuse same function as for weekend
                  // I had limited time to finish but i will commit to git and keep updating when i get some free time.
                  break;
                case "month":
                // I plan to do a similar implementation to find month start and end date and reuse same function as for weekend
                  break;
                default:
              }
        }

        if (!_.isEmpty(searchParams.amenities)){
            _.forEach(searchParams.amenities, function(amenitie) {
                matchQuery += ` AND amenities::text ilike '%`+ amenitie +`%'`
              });
        }

        if (!_.isEmpty(searchParams.apartmentType)){
            matchQuery += ` AND property_type::text = '`+ searchParams.apartmentType +`'`
        }

        matchQuery += ` group by p.id`;
        console.log(matchQuery);

        const exactMatchStays = await db.sequelize.query(matchQuery, { type: QueryTypes.SELECT });

        if(!_.isEmpty(exactMatchStays)){
            result.match.push(exactMatchStays)
        }
        
        return result;
    } else {
        return sanitization;
    }
};

let checkIfAvailableByDate = (startDate, endDate) =>{
    const query = ` AND
    (('`+ startDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ startDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)
    AND (('`+ endDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ endDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)`;

    return query;
}

function calculateWeekEndForAMonth(month){
    const monthNumber = moment().month(month).format("M");
    const weekendDates = sundaysInMonth(monthNumber, 2021);
    console.log(weekendDates);
    return weekendDates;
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