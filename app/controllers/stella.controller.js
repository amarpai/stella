const db = require("../models");
const Property = db.property;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');
const service = require("../services/stella.service");


exports.findAll = async (req, res) => {
    const result = await service.filterStellaListings(req.body);
    res.send(result);
};