module.exports = (sequelize, Sequelize) => {
    const Availability = sequelize.define("availability", {
        property_id: {
            type: Sequelize.BIGINT
        },
        start_date: {
            type: Sequelize.DATEONLY
        },
        end_date: {
            type: Sequelize.DATEONLY
        },
        is_blocked: {
            type: Sequelize.BOOLEAN
        }
    });

    return Availability;
};