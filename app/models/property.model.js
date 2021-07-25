module.exports = (sequelize, Sequelize) => {
    const Property = sequelize.define("property", {
        building_id: {
            type: Sequelize.BIGINT
        },
        title: {
            type: Sequelize.STRING
        },
        property_type: {
            type: Sequelize.ENUM('1bdr', '2bdr', '3bdr')
        },
        amenities: {
            type: Sequelize.ARRAY(Sequelize.ENUM('WiFi', 'Pool', 'Garden', 'Tennis table', 'Parking'))
        }
    });

    return Property;
};