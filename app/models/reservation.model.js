module.exports = (sequelize, Sequelize) => {
    const Reservation = sequelize.define("reservation", {
        check_in: {
            type: Sequelize.DATEONLY
        },
        check_out: {
            type: Sequelize.DATEONLY
        },
        property_id: {
            type: Sequelize.BIGINT
        }
    });

    return Reservation;
};