module.exports = app => {
    const stella = require("../controllers/stella.controller.js");

    var router = require("express").Router();

    router.post("/listings", stella.findAll);

    app.use('/api/v1', router);
};