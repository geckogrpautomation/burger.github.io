
const Sequelize = require('sequelize');

//Connect to correct database. Input your correct credentials here
const sequelize = new Sequelize('burger_db', 'root', 'RmkL!CB~x2t>D;Y>%9-B_nnD', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 9,
    min: 0,
    idle: 10000
  }
});

sequelize.authenticate().then(() => {  
    console.log(`Successfully connected to burger_db`);
}).catch((err) => {
  console.log(`Error when connecting to burger_db ----->  ${err}`);
});



module.exports = sequelize;


    
  
  