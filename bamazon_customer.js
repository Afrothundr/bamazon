//dependencies 
var inquirer = require('inquirer');
var mysql = require("mysql");
var Table = require('cli-table');

//establish connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	//username
	user: "root",
	//database
	database: "bamazon"
});
 //connect to database
function connect() {
	connection.connect(function(err) {
		if (err) throw err;
		//if successful, run print function
		print();
	});
}

//function to print products table
function print() {
		//create new display table
		var table = new Table({
		    head: ['id', 'name', 'department', 'price', 'quantity']
		});
		//select all of the information from our products table
		connection.query("SELECT * FROM products", function(err, res){
			if (err) throw err;
			//add that information into our display table
			res.forEach(function(element) {
				table.push([
					element.item_id, 
					element.product_name, 
					element.department_name,
					`$ ${element.price}`,
					element.stock_quantity
				]);
			});
			//display table to console
			console.log("Our current selection:");
			console.log(table.toString());
		orderItem();
		});
	}
//order item function
function orderItem() {
	inquirer.prompt([
		{
		  type: 'input',
		  name: 'item_number',
		  message: 'Please enter id number of what you would like to buy',
		  validate: function(value){
		  	if(!(isNaN(value)) && value < 13 && value > 0){
		  		return true;
		  	}
		  	return false;
		  }
		},
		{
		  type: 'input',
		  name: 'quantity',
		  message: 'How many would you like to purchase?',
		  validate: function(value){
		  	if(isNaN(value)){
		  		return false;
		  	}
		  	return true;
		  }
		}
		]).then(function(answer){
			//select data from row the user selected
			connection.query(`SELECT * FROM products WHERE item_id = ${answer.item_number}`,
			function(err, res) {
			  // total cost of purchase
			  var cost = res[0].price * answer.quantity;
			  //confirm there is enough product to fufill order
				if(res[0].stock_quantity < answer.quantity) {
					console.log('Insufficent quantity!');
				} else {
						//calculate new total
						var newQuantity = parseInt(res[0].stock_quantity) - parseInt(answer.quantity);
						//update product purchased
						connection.query(
			            "UPDATE products SET ? WHERE ?",
			            [
			              {
			                stock_quantity: newQuantity
			              },
			              {
			                item_id: answer.item_number
			              }
			            ],
			        function(err, res) {
			         if (err) throw err;
			        //log total cost of purchase, and thank user
			          console.log(`Your total cost is $${cost}
Thank you for your purchase!`);
		            });
				  }
			//end connection
				connection.end();
			}
			);
		});
}
//start connection
connect();
