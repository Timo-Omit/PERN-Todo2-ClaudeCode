const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db')

//Middleware
app.use(cors());
app.use(express.json()); //Allows is to add req.body(On Postman "Request->body->raw")

app.listen(5000, () =>{
    console.log("IT'S ON 5000!!!")
});

//ROUTES//

//CREATE a Todo (POST bc we are adding data.)

app.post("/todos", async(req, res) => {
    try {
        const { description } = req.body;
        const newTodo = await pool.query(
            "INSERT INTO todo (description) VALUES($1)RETURNING *", 
            [description]);

        res.json(newTodo.rows[0]);
    } catch (error) {
        console.error(error.message)
    }
});



//GET all Todos
app.get("/todos", async(req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo")
        res.json(allTodos.rows);

    } catch (error) {
        console.error(error.message)
    }
})

//GET a Todo
app.get("/todos/:id", async (req, res) =>{
    try {
      const {id} = req.params;
      const todo = await pool.query(
        "SELECT * FROM todo WHERE todo_id = $1", 
        [id])
        res.json(todo.rows[0])
    } catch (error) {
        console.error(error.message)
    }
})

//Update(PUT) a Todo
app.put("/todos/:id", async(req, res) =>{
    try {
      const {id} = req.params
      const {description} = req.body;
      const updateTodo = await pool.query(
        "UPDATE todo SET description = $1 WHERE todo_id = $2",
        [description, id]);
        res.json("Updated")
    } catch (error) {
        console.error(error.message);
    }
})


//DELETE a Todo

app.delete("/todos/:id",  async(req, res) =>{
    try {
        const {id} = req.params;
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id])
        res.json("Deleted!")
    } catch (error) {
        console.log(err.message)
    }

})
