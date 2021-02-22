const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { errorMonitor } = require('events');
const { resolve } = require('path');
const router = express.Router();
const mdl = require(path.join(__dirname,'../model/burger'));


//<----------------------------------------------------------------------------Authentication constants and scripts------------------------------------------------------------------------>
let users = [];

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

//Check in coming cookie to see if it is a match in the database. If so, then ok to view protected pages else redirect to login.
const requireAuth = (req, res, next) => {

    let token = req.cookies.ArrowCookie;
    

    if (token) {
        mdl.token.findOne({where: {token: token}}).then((res) => {
            
            if (res.dataValues.token === token){    
                next();
            }
            else{
                res.render('login', {
                message: 'Incorrect credentials',
                messageClass: 'alert-danger'
            });
            }
        })

    }else{
        res.render('login', {
            message: 'Incorrect credentials',
            messageClass: 'alert-danger'
        });
    }
}

//Run this periodically to flush out old cookies.
function flushCookies(){

    mdl.token.sync({ force: true });

}

//<------------------------------------------------------------------------------------GET---------------------------------------------------------------------------------------------->

router.get('/', function (req, res) {

    res.render('log_reg');
  
});


router.get('/enrol', (req, res) => {

    res.render('enrol');

});

router.get('/login', (req, res) => {

    res.render('login');

});

router.get('/eatdaburger', requireAuth, (req, res) => {

    let subBurger = [];

    mdl.subBurger.findAll({attributes: ['id' , 'burger']}).then((response) => {   

        response.forEach(e => {

            subBurger.push({id: e.dataValues.id , burger : e.dataValues.burger });
                       
        });   
    });

    let devBurger = [];

    mdl.devBurger.findAll({attributes: ['id' , 'burger']}).then((response) => {     

        response.forEach(e => {

            devBurger.push({id: e.dataValues.id , burger : e.dataValues.burger });
           
        });                 
        
        res.render('eatdaburger', {subBurger : subBurger , devBurger : devBurger });

    });

});

//<------------------------------------------------------------------------------------POST---------------------------------------------------------------------------------------------->

router.post('/enrol', (req, res) => {

    // Deconstruct req.body from post
    let {  firstName, lastName, email, mobile , password, confirmPassword } = req.body

    //Return current users from db
    mdl.burgUser.findAll({attributes: ['first_name', 'last_name', 'email', 'mobile', 'password']}).then((results) => {
        
        //Only get the user datavalues returned from the query structure
        results.forEach(el => {

            users.push(el.dataValues)        
        
         })

         if (users.length > 0){ 
             
            if (password === confirmPassword) {

                // Check if user with the same email is also registered
                if (users.find(user => user.email === email)) {
        
                    res.render('enrol', {
                        message: 'User already registered.',
                        messageClass: 'alert-danger'
                    });
        
                    return;
                }
                
                let hashedPassword = getHashedPassword(password)
        
                // Store user into the database if you are using one
                mdl.burgUser.create({first_name : firstName , last_name : lastName, email : email, mobile : mobile, password : hashedPassword}).then(() => {
        
                res.render('login', {
                    message: 'Registration Complete. Please login to continue.',
                    messageClass: 'alert-success'
                })  


                });             

            

            } else {
                res.render('enrol', {
                    message: 'Password does not match.',
                    messageClass: 'alert-danger'
                });
            }
        }
        else{
            res.status(500).send("Server error. Please contact server administration");
        }
    });
});
 


router.post('/login', (req, res) => {

    
    let { email, password } = req.body
    
    let hashedPassword = getHashedPassword(password);

    mdl.burgUser.findAll({attributes: ['email', 'password']}).then((results) => {   

        const user = results.find(u => {       
                
            return u.dataValues.email === email && hashedPassword === u.dataValues.password
            
        });

        if (user){
    
       

        if (user.email === email && user.password === hashedPassword) {
        
                const authToken = generateAuthToken();

            // Store authentication token against the user in the database
            mdl.token.create({token : authToken , email : user.email, password : hashedPassword }).then(() => {

                // Setting the auth token in cookies
                res.cookie('ArrowCookie', authToken,{maxAge: 86400000});
                
                // Redirect user to the protected page
                res.redirect('/eatdaburger');

            }); 
            
        } 
        else {
            res.render('login', {
                message: 'Invalid username or password',
                messageClass: 'alert-danger'
            });
        }
    }
    });
});


router.post('/api/add/:burger', (req, res) => {

       

    if (req.params.burger){

        // Store user into the database if you are using one
        mdl.subBurger.create({burger : req.params.burger}).then(() => {   
            
            res.status(200).send();
        })
        .catch( (err) => {

            res.status(500).send(err);

        });
    }

});

 //<------------------------------------------------------------------------------------PUT---------------------------------------------------------------------------------------------->

 //Devour the burger from the ordered burger list and add to the devoured burgers database
router.post('/api/devBurger/:id', function (req, res) {

    
    let id = req.params.id;
    
    console.log("this is my put id   --- " + id);

    function get() {

        return new Promise(resolve => {

            mdl.subBurger.findAll(
                {where: {
                    id: id
                }
            }).then((dbRes) => { 
                       
            resolve(dbRes)  
            })
                        
        });
    }


    function create(dbRes) {

        let arr = [];
        
        dbRes.forEach(e => {

            arr.push({burger : e.dataValues.burger});
           
        });
        
        console.log("this is for create - " +  arr[0].burger)
       
        return new Promise(resolve => {
           
          mdl.devBurger.create({burger : arr[0].burger})
          .then(() => {         
           console.log("create done");
           })

        resolve()

        });
    }


    function del() {
        return new Promise(resolve => {

            mdl.subBurger.destroy(
                {where: {
                    id: id
                }
            }).then(() => {         
                console.log("destroy done");
            })

        resolve()

        });
    }
    console.log()
    get().then((dbRes) => create(dbRes)).then(() => del().then( ()=> {

        res.status(200).send("OK");
    }));

});

 //Clear the burger from the devoured burger list.
router.post('/api/clrBurger/:id', function (req, res) {

    let id = req.params.id;
    
    console.log("this is my put id   --- " + id);

    function del() {
        return new Promise(resolve => {

            mdl.devBurger.destroy(
                {where: {
                    id: id
                }
            }).then(() => {         
                console.log(`Dev Burger destroy done with id = ${id}`);
            })

        resolve()

        });
    }    

    del().then( () => {res.status(200).send("OK");});
        
});
  
 //<------------------------------------------------------------------------------------DELETE---------------------------------------------------------------------------------------------->

 //Drop devBurger databse and reinstate it with no data
 router.delete('/api/devburg/', function (req, res) {

    mdl.devBurger.sync({ force: true });

 });


//<------------------------------------------------------------------------------------SCRIPTS---------------------------------------------------------------------------------------------->

// Export routes for server.js to use.
module.exports = router;


