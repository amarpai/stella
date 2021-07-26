const { query } = require("express");
const db = require("../models");

const { QueryTypes } = require('sequelize');
var moment = require('moment');
var _ = require('lodash');

const validation = require("../services/validation.service");
const dateService = require("../services/date.service");

exports.filterStellaListings = async (searchParams, alternative = false) => {

    console.log(searchParams);
    const sanitization = validation.inputValidation(searchParams);
    if(sanitization.error == false){
        result = {match: [], alternative: [], other: []}
        let matchQuery = getBaseQueryByCity(searchParams.city);

        if (!_.isEmpty(searchParams.date)){
            matchQuery += checkIfAvailableByDate(searchParams.date.start, searchParams.date.end, "AND");

        } else if (!_.isEmpty(searchParams.flexible)){

            switch(searchParams.flexible.type) {
                case "weekend":
                    _.forEach(searchParams.flexible.months, function(month) {
                        let weekendDates =  dateService.calculateWeekEndForAMonth(month, searchParams);
                        _.forEach(weekendDates, function(endDate, index) {
                            let startDate;
                            if(searchParams.city.toLowerCase() != 'dubai'){
                                startDate =  getFormattedDate(endDate, 1);
                            } else {
                                startDate =  getFormattedDate(endDate, 2);
                                endDate =  getFormattedDate(endDate, 1);
                            }
                            matchQuery += checkIfAvailableByDate(startDate, endDate, index==0?" AND ( ":"OR");
                          });
                      });
                      matchQuery += `)`;
                    break;
                case "week":
                    _.forEach(searchParams.flexible.months, function(month) {
                        let weekDates =  dateService.calculateWeekEndForAMonth(month, searchParams);
                        _.forEach(weekDates, function(endDate, index) {
                            const startDate =  getFormattedDate(endDate, 6);
                            matchQuery += checkIfAvailableByDate(startDate, endDate, index==0?" AND (  ":"OR");
                          });
                      });
                      matchQuery += `)`;
                    break;
                  break;
                case "month":
                    _.forEach(searchParams.flexible.months, function(month, index) {
                        const dateRange =  dateService.getStartAndEndOfMonth(month);
                        matchQuery += checkIfAvailableByDate(dateRange.start, dateRange.end, index==0?" AND (  ":"OR");
                      });
                      matchQuery += `)`;
                  break;
                default:
                    matchQuery += ``;
              }
        }

        if (!_.isEmpty(searchParams.amenities)){
            matchQuery += filterByAminities(searchParams.amenities);
        }

        if (!_.isEmpty(searchParams.apartmentType)){
            matchQuery += filterByPropertyType(searchParams.apartmentType);
        }

        matchQuery += groupByClause();
        const exactMatchStays = await executeQuery(matchQuery);

        if(!_.isEmpty(exactMatchStays)){
            result.match.push(exactMatchStays);
        } else {
            alternativeSearch(searchParams);
        }

        if(alternative){
            result.alternative.push(exactMatchStays);
        }
        
        return result;
    } else {
        return sanitization;
    }
};

function alternativeSearch(searchParams){
    searchParams.date.start = getFurtherDate(searchParams.date.start,1);
    searchParams.date.end = getFurtherDate(searchParams.date.end,1);
    filterStellaListings(searchParams, true);
}

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

function getFurtherDate(date, addDays){
    return  moment(date, 'YYYY-MM-DD').add(addDays,'days').format('YYYY-MM-DD');
}

function getBaseQueryByCity(city){
    const query = `select p.* from property p 
    LEFT join availability a ON (p.id = a.property_id and is_blocked = true)
    LEFT join reservation r ON (p.id = r.property_id)
    LEFT join building b ON b.id = p.building_id
    where  b.city='`+ city + `'`;

    return query;
}

function checkIfAvailableByDate(startDate, endDate, joinCondition) {
    const query = joinCondition + ` ( 
    (('`+ startDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ startDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)
    AND (('`+ endDate +`' NOT BETWEEN a.start_date and a.end_date) OR a.start_date IS NULL) AND
    (('`+ endDate +`' NOT BETWEEN r.check_in and r.check_out) OR r.check_in IS NULL)) `;

    return query;
}