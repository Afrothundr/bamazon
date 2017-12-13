var mysql = require("mysql");
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	database: "bamazon"
});

function Database() {
	this.items = [];
	this.connect = function() {
		connection.connect(function(err) {
			if (err) throw err;
			console.log(`connected as id ${connection.threadId}`);
		});
	};
	this.print = function() {
		var table = new Table({
		    head: ['id', 'name', 'department', 'price', 'quantity']
		});
		connection.query("SELECT * FROM products", function(err, res){
			if (err) throw err;
			res.forEach(function(element) {
				table.push([
					element.item_id, 
					element.product_name, 
					element.department_name,
					`$ ${element.price}`,
					element.stock_quantity
				]);
			});
			console.log(table.toString());
		});
	};
	this.update = function(item_number, quantity) {
		connection.query(`SELECT * FROM products WHERE item_id = ${item_number}`,
			function(err, res) {
			  var cost = res[0].price * quantity;
				if(res[0].stock_quantity < quantity) {
					console.log('Insufficent quantity!');
				} else {
						var newQuantity = parseInt(res[0].stock_quantity) - parseInt(quantity);
						connection.query(
			            "UPDATE products SET ? WHERE ?",
			            [
			              {
			                stock_quantity: newQuantity
			              },
			              {
			                item_id: item_number
			              }
			            ],
			            function(err, res) {
			              if (err) throw err;
			              console.log(`Your total cost is $${cost}
Thank you for your purchase!`);
		            	});
					}
			connection.end();
			}
		);
	}
}

var bamazon = new Database();
bamazon.connect();
bamazon.print();
bamazon.update(9, 5);

