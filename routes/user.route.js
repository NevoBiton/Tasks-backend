const express = require("express")
const router = express.Router();

const {
    addTask,
    deleteTask,
    getUserTasks,
    editTask
  } = require("../controllers/user.controller");
  

router.post("/", addTask);
router.delete("/:taskId", deleteTask);
router.get("/", getUserTasks);
router.patch("/:taskId", editTask);



module.exports = router;