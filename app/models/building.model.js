module.exports = (sequelize, Sequelize) => {
    const Building = sequelize.define("building", {
        city: {
            type: Sequelize.ENUM('Dubai', 'Montreal')
        },
    });

    return Building;
};