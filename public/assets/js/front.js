


//Get objects 
const addBurgInpObj = document.getElementById("add-burg-inp");
const addBurgObj = document.getElementById("add-burg-btn");
const devBtnObj = document.querySelectorAll('.dev-btn');
const clrBtnObj = document.querySelectorAll('.clr-btn');

//Add event handlers.

//Add to the eat burger list

if (addBurgObj){

  addBurgObj.addEventListener('click' , (e) => {

    let burg = addBurgInpObj.value.trim();
    
    if (addBurgInpObj.value){

      fetch(`/api/add/${addBurgInpObj.value}`, {
          method: 'POST',
        
        }).then(() => {          

          console.log("OK")
        location.reload();

        })
      
    } 
    else {
      alert('Please try again!');
    }
    
  });

}


if (devBtnObj){

  devBtnObj.forEach(btn => {
    
    btn.addEventListener('click', (e) => {

      console.groupCollapsed("devBtnObj events added");

      const id = e.target.getAttribute('data-id');
      console.log(id);
      fetch(`/api/devBurger/${id}`, {
        method: 'POST',
        
      }).then((response) => {
        // Check that the response is all good
        // Reload the page so the user can see the new quote
        if (response.ok) {
          console.log(`Devoured burger at index : ${id}`);
          location.reload('/');
        } else {
          alert('something went wrong!');
        }
      });
      
    });
  });
}


if (clrBtnObj){

  clrBtnObj.forEach(btn => {
    
    btn.addEventListener('click', (e) => {

      console.groupCollapsed("devBtnObj events added");

      const id = e.target.getAttribute('data-id');
      console.log(id);
      fetch(`/api/clrBurger/${id}`, {
        method: 'POST',
        
      }).then((response) => {
        // Check that the response is all good
        // Reload the page so the user can see the new quote
        if (response.ok) {
          console.log(`Cleared burger at index : ${id}`);
          location.reload('/');
        } else {
          alert('something went wrong!');
        }
      });
      
    });
  });
}



